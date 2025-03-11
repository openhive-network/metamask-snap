import createBeekeeper, { type IBeekeeperUnlockedWallet, type IBeekeeperInstance, type IBeekeeperSession } from "@hiveio/beekeeper";

let _beekeeper: undefined | IBeekeeperInstance;
let _session: undefined | IBeekeeperSession;
const getBeekeeperSession = async (): Promise<IBeekeeperSession> => {
  if (!_beekeeper || !_session) {
    _beekeeper = await createBeekeeper({ enableLogs: false, inMemory: true });
    _session = _beekeeper.createSession("salt");
  }

  return _session;
};

export const getTempWallet = async (): Promise<IBeekeeperUnlockedWallet> => {
  const session = await getBeekeeperSession();
  const walletName = "w" + Date.now();
  const { wallet } = await session.createWallet(walletName, "pass", true);
  return wallet;
};
