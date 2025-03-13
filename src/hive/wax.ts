import { createWaxFoundation, DEFAULT_WAX_OPTIONS, type IWaxBaseInterface } from "@hiveio/wax";

const waxInstances: Record<string, IWaxBaseInterface> = {};
export const getWax = async (chainId: string = DEFAULT_WAX_OPTIONS.chainId): Promise<IWaxBaseInterface> => {
  if (!waxInstances[chainId])
    waxInstances[chainId] = await createWaxFoundation(chainId !== undefined ? { chainId } : undefined);

  return waxInstances[chainId];
};
