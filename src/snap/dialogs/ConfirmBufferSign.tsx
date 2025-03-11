import { Bold, Copyable, Text, Box, Italic } from "@metamask/snaps-sdk/jsx";
import { KeyIndex } from "../../rpc";

export const ConfirmBufferSign = (origin: string, buffer: string, firstKey: KeyIndex, secondKey?: KeyIndex | string) => snap.request({
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
        <Text>
          - <Bold>{firstKeykey.role}</Bold> key (account index: <Italic>#{ String(firstKey.accountIndex ?? 0) }</Italic>)
        </Text>
        { secondKey ? (typeof secondKey === "string" ?
          <Text>This message will be encrypted for: <Copyable value={secondKey}/></Text> :
          <Text>This message will be encrypted for: <Bold>{secondKey.role}</Bold> key (account index: <Italic>#{ String(secondKey.accountIndex ?? 0) }</Italic>)</Text>
        ) : <Text>This message can only be viewed by you</Text> }
      </Box>
    )
  }
});
