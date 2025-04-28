import {
  createWaxFoundation,
  DEFAULT_WAX_OPTIONS,
  type IWaxBaseInterface
} from "@hiveio/wax";
import { InternalError } from "@metamask/snaps-sdk";

const waxInstances: Record<string, Promise<IWaxBaseInterface>> = {};
export const getWax = async (
  chainId: string = DEFAULT_WAX_OPTIONS.chainId
): Promise<IWaxBaseInterface> => {
  if (!waxInstances[chainId]) {
    return (waxInstances[chainId] = createWaxFoundation(
      chainId === undefined ? undefined : { chainId }
    )).catch((error) => {
      throw new InternalError("Failed to encrypt", {
        cause: error instanceof Error ? error.message : String(error)
      }) as Error;
    });
  }

  return waxInstances[chainId];
};
