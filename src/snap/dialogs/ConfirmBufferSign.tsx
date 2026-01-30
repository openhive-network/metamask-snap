import { Bold, Copyable, Text, Box } from "@metamask/snaps-sdk/jsx";

import { KeyTypeNotice } from "./components/KeyTypeNotice";
import type { KeyIndex } from "../../rpc";

export const ConfirmBufferSign = async (
  origin: string,
  buffer: string,
  firstKey: KeyIndex,
  secondKey?: KeyIndex | string,
  byteLength?: number
) =>
  snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: (
        <Box>
          <Text>
            <Bold>{origin}</Bold> asked to sign a buffer:
          </Text>
          {byteLength === undefined ? (
            <Copyable value={buffer} />
          ) : (
            <Box>
              <Text>Hexadecimal data ({String(byteLength)} bytes):</Text>
              <Copyable value={buffer} />
            </Box>
          )}
          <Text>Confirm if you want to sign it using your:</Text>
          {KeyTypeNotice(firstKey)}
          <Text>This message will be encrypted for: </Text>
          {secondKey && typeof secondKey === "string" && (
            <Copyable value={secondKey} />
          )}
          {secondKey &&
            typeof secondKey === "object" &&
            KeyTypeNotice(secondKey)}
          {!secondKey && (
            <Text>
              - <Bold>yourself</Bold>
            </Text>
          )}
        </Box>
      )
    }
  });
