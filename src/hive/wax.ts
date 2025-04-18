import {
  createWaxFoundation,
  DEFAULT_WAX_OPTIONS,
  type IWaxBaseInterface
} from "@hiveio/wax";

const waxInstances: Record<string, Promise<IWaxBaseInterface>> = {};
export const getWax = async (
  chainId: string = DEFAULT_WAX_OPTIONS.chainId
): Promise<IWaxBaseInterface> => {
  if (!waxInstances[chainId]) {
    return (waxInstances[chainId] = createWaxFoundation(
      chainId === undefined ? undefined : { chainId }
    ));
  }

  return waxInstances[chainId];
};
