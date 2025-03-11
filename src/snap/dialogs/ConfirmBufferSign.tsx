import { Bold, Copyable, Text, Box, Italic } from "@metamask/snaps-sdk/jsx";
import { KeyIndex } from "../../rpc";

export const ConfirmBufferSign = (origin: string, buffer: string, keys: KeyIndex[]) => snap.request({
  method: 'snap_dialog',
  params: {
    type: 'confirmation',
    content: (
      <Box>
        <Text>
          <Bold>{ origin }</Bold> asked to sign a buffer:
        </Text>
        <Copyable value={ buffer } />
        <Text>
          Confirm if you want to sign it using your:
        </Text>
        { keys.map(key => (<Text>
          - <Bold>{key.role}</Bold> key (account index: <Italic>#{ String(key.accountIndex ?? 0) }</Italic>)
        </Text>))}
      </Box>
    )
  }
});
