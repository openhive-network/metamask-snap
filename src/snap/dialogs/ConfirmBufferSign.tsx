import { Bold, Copyable, Text, Box } from "@metamask/snaps-sdk/jsx";
import { KeyIndex } from "../../rpc";
import { KeyTypeNotice } from "./components/KeyTypeNotice";

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
        {KeyTypeNotice(firstKey)}
        <Text>This message will be encrypted for: </Text>
        { secondKey && typeof secondKey === "string" && <Copyable value={ secondKey }/> }
        { secondKey && typeof secondKey === "object" && KeyTypeNotice(secondKey) }
        { !secondKey && <Text>- <Bold>yourself</Bold></Text> }
      </Box>
    )
  }
});
