import { Bold, Copyable, Text, Box } from "@metamask/snaps-sdk/jsx";
import { KeyIndex } from "../../rpc";
import { KeyTypeNotice } from "./components/KeyTypeNotice";

export const ConfirmTransactionSign = (origin: string, transaction: string, keys: KeyIndex[]) => snap.request({
  method: 'snap_dialog',
  params: {
    type: 'confirmation',
    content: (
      <Box>
        <Text>
          <Bold>{ origin }</Bold> asked to sign a transaction:
        </Text>
        <Copyable value={ transaction } />
        <Text>
          Confirm if you want to sign it using your:
        </Text>
        {KeyTypeNotice(...keys)}
      </Box>
    )
  }
});
