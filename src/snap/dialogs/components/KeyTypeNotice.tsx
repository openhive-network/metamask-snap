import { Bold, Text, Italic } from "@metamask/snaps-sdk/jsx";
import type { KeyIndex } from "../../../rpc";

export const KeyTypeNotice = (...keys: KeyIndex[]) => keys.map(key => (
  <Text>
    - <Bold>{key.role}</Bold> key (account index: <Italic>#{ String(key.accountIndex ?? 0) }</Italic>)
  </Text>
));
