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
          - <Bold>{firstKey.role}</Bold> key (account index: <Italic>#{ String(firstKey.accountIndex ?? 0) }</Italic>)
        </Text>
        <Text>This message will be encrypted for: </Text>
        { secondKey ? (typeof secondKey === "string" ?
          <Copyable value={ secondKey }/> :
          <Text>- <Bold>{secondKey.role}</Bold> key (account index: <Italic>#{ String(secondKey.accountIndex ?? 0) }</Italic>)</Text>
        ) : <Text>- <Bold>yourself</Bold></Text> }
      </Box>
    )
  }
});
