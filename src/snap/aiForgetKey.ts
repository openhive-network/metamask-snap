import { getProvider } from "../ai/providers";
import { forgetKey } from "../ai/state";

export const aiForgetKey = async (
  origin: string,
  provider: unknown
): Promise<boolean> => forgetKey(origin, getProvider(provider).id);
