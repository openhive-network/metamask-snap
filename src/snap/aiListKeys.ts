import { listKeys } from "../ai/state";
import type { AiKeyInfo } from "../rpc";

export const aiListKeys = async (origin: string): Promise<AiKeyInfo[]> =>
  listKeys(origin);
