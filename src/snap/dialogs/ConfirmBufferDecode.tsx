import { Bold, Copyable, Text, Box, Italic } from "@metamask/snaps-sdk/jsx";
import type { KeyIndex } from "../../rpc";

export const ConfirmBufferDecode = (origin: string, buffer: string, decodeKey: KeyIndex) => snap.request({
  method: 'snap_dialog',
  params: {
    type: 'confirmation',
    content: (
      <Box>
        <Text>
          <Bold>{ origin }</Bold> asked to decode a buffer:
        </Text>
        <Copyable value={ buffer } />
        <Text>
          Confirm if you want to sign it using your:
        </Text>
        <Text>
          - <Bold>{decodeKey.role}</Bold> key (account index: <Italic>#{ String(decodeKey.accountIndex ?? 0) }</Italic>)
        </Text>
      </Box>
    )
  }
});
