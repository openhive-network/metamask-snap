import createBeekeeper, {
  type IBeekeeperUnlockedWallet,
  type IBeekeeperSession
} from "@hiveio/beekeeper";
import { InternalError } from "@metamask/snaps-sdk";

let _session: Promise<IBeekeeperSession> | undefined;

/**
 * Gives beekeeper's emscripten runtime the `performance.now()` clock it reads
 * when creating sessions. Snaps get no `performance` endowment, so the clock
 * falls back to the snap's `Date`.
 */
const providePerformanceClock = (): void => {
  if (typeof globalThis.performance === "undefined") {
    globalThis.performance = {
      now: () => Date.now()
    } as typeof globalThis.performance;
  }
};

const getBeekeeperSession = async (): Promise<IBeekeeperSession> => {
  if (!_session) {
    providePerformanceClock();

    return (_session = createBeekeeper({
      enableLogs: false,
      inMemory: true
    }).then((beekeeper) => {
      const array = new Uint32Array(1);
      globalThis.crypto.getRandomValues(array);

      return beekeeper.createSession(String(array[0]));
    })).catch((error) => {
      throw new InternalError("Failed to initialize beekeeper session", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    });
  }

  return _session;
};

export const getTempWallet = async (): Promise<IBeekeeperUnlockedWallet> => {
  try {
    const session = await getBeekeeperSession();
    const walletName = `w${Date.now()}`;
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    const { wallet } = await session.createWallet(
      walletName,
      String(array[0]),
      true
    );
    return wallet;
  } catch (error) {
    throw new InternalError("Failed to retrieve the beekeeper wallet", {
      cause: error instanceof Error ? error.message : String(error)
    }) as Error;
  }
};
