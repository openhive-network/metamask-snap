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
      const array = new Uint32Array(1);
      globalThis.crypto.getRandomValues(array);

      return beekeeper.createSession(String(array[0]));
    }));
  }

  return _session;
};

export const getTempWallet = async (): Promise<IBeekeeperUnlockedWallet> => {
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
};
