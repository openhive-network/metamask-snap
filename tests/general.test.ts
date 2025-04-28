import { installSnap } from "@metamask/snaps-jest";

describe("onRpcRequest", () => {
  describe("General tests", () => {
    it("should not be able to call non-existent method", async () => {
      const { request } = await installSnap();

      const origin = "Jest";
      const response = await request({
        origin,
        method: "hive_someMethod",
        params: {}
      });

      expect(response).toRespondWithError({
        message: "The method does not exist / is not available.",
        code: -32601,
        stack: expect.any(String)
      });
    });
  });
});
