import { Bold, Text, Italic } from "@metamask/snaps-sdk/jsx";

import type { KeyIndex } from "../../../rpc";

export const KeyTypeNotice = (...keys: KeyIndex[]) =>
  keys.map((key) => {
    if (key.role !== undefined) {
      return (
        <Text>
          - <Bold>{key.role}</Bold> key (account index:{" "}
          <Italic>#{String(key.accountIndex ?? 0)}</Italic>)
        </Text>
      );
    }
    return (
      <Text>
        - custom key at address index <Bold>{String(key.addressIndex)}</Bold>{" "}
        (account index: <Italic>#{String(key.accountIndex ?? 0)}</Italic>)
      </Text>
    );
  });
