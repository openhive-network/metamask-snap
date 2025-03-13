import { Bold, Copyable, Text, Box } from "@metamask/snaps-sdk/jsx";
import type { KeyIndex } from "../../rpc";
import { KeyTypeNotice } from "./components/KeyTypeNotice";

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
        {KeyTypeNotice(decodeKey)}
      </Box>
    )
  }
});
