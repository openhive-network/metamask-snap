import createBeekeeper, {
  type IBeekeeperUnlockedWallet,
  type IBeekeeperSession
} from "@hiveio/beekeeper";

let _session: Promise<IBeekeeperSession> | undefined;

const getBeekeeperSession = async (): Promise<IBeekeeperSession> => {
  if (!_session) {
    return (_session = createBeekeeper({
      enableLogs: false,
      inMemory: true
    }).then((beekeeper) => {
      return beekeeper.createSession("salt");
    }));
  }

  return _session;
};

export const getTempWallet = async (): Promise<IBeekeeperUnlockedWallet> => {
  const session = await getBeekeeperSession();
  const walletName = `w${Date.now()}`;
  const { wallet } = await session.createWallet(walletName, "pass", true);
  return wallet;
};
