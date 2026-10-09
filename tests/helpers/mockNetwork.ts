import { installSnap } from "@metamask/snaps-jest";
import { createRequire } from "module";
import { MessageChannel, Worker } from "worker_threads";

export type CapturedRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  redirect: string;
  body: string | null;
};

export type MockReply =
  | { status: number; body: string; headers?: Record<string, string> }
  | { error: string };

// The snap runs in a worker thread started by the execution service that
// @metamask/snaps-simulation uses. Resolve that service and the worker bundle
// through the same dependency chain so the mock runs the same environment.
const jestRequire = createRequire(require.resolve("@metamask/snaps-jest"));
const simulationRequire = createRequire(
  jestRequire.resolve("@metamask/snaps-simulation")
);
const controllersRequire = createRequire(
  simulationRequire.resolve("@metamask/snaps-controllers/node")
);
const { NodeThreadExecutionService } = controllersRequire(
  "@metamask/snaps-controllers/node"
);
const { ThreadParentMessageStream } = controllersRequire(
  "@metamask/post-message-stream"
);
const WORKER_BUNDLE = controllersRequire.resolve(
  "@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js"
);

// Replaces the worker's fetch before the execution environment loads, so the
// snap's network endowment sends every request to the test over `port`.
const WORKER_SOURCE = `
const { workerData } = require("worker_threads");
const { port, bundle } = workerData;
const pending = new Map();
let nextId = 0;
port.on("message", ({ id, reply }) => {
  const { resolve, reject } = pending.get(id);
  pending.delete(id);
  if (reply.error !== undefined) {
    reject(new TypeError(reply.error));
  } else {
    resolve(new Response(reply.body, { status: reply.status, headers: reply.headers }));
  }
});
globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  const body = request.body === null ? null : await request.text();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    port.postMessage({
      id,
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers),
        redirect: request.redirect,
        body
      }
    });
  });
};
require(bundle);
`;

type ExecutionService = NonNullable<
  NonNullable<Parameters<typeof installSnap>[1]>["executionService"]
>;

/**
 * Install the snap with a `fetch` that never reaches the network.
 * @param reply - Answers each outbound request.
 * @returns The installed snap and the requests its `fetch` received.
 */
export const installSnapWithMockedNetwork = async (
  reply: (request: CapturedRequest) => MockReply
) => {
  const requests: CapturedRequest[] = [];

  class MockedNetworkExecutionService extends NodeThreadExecutionService {
    async initEnvStream() {
      const { port1, port2 } = new MessageChannel();
      port1.on(
        "message",
        ({ id, request }: { id: number; request: CapturedRequest }) => {
          requests.push(request);
          port1.postMessage({ id, reply: reply(request) });
        }
      );
      port1.unref();

      const worker = new Worker(WORKER_SOURCE, {
        eval: true,
        workerData: { port: port2, bundle: WORKER_BUNDLE },
        transferList: [port2],
        stdout: true,
        stderr: true
      });
      const stream = new ThreadParentMessageStream({ thread: worker });
      return Promise.resolve({ worker, stream });
    }
  }

  const snap = await installSnap({
    // The base class comes from an untyped require of the simulation's own
    // @metamask/snaps-controllers.
    executionService:
      MockedNetworkExecutionService as unknown as ExecutionService
  });
  return { ...snap, requests };
};
