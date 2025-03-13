import { Bold, Copyable, Text, Box, Banner, Italic } from "@metamask/snaps-sdk/jsx";
import { KeyIndex } from "../../rpc";
import { KeyTypeNotice } from "./components/KeyTypeNotice";
import { DEFAULT_WAX_OPTIONS } from "@hiveio/wax";

export const ConfirmTransactionSign = (origin: string, transaction: string, keys: KeyIndex[], chainId?: string) => snap.request({
  method: 'snap_dialog',
  params: {
    type: 'confirmation',
    content: (
      <Box>
        <Text>
          <Bold>{origin}</Bold> asked to sign a transaction:
        </Text>
        <Copyable value={transaction} />
        {chainId && chainId !== DEFAULT_WAX_OPTIONS.chainId && <Banner title="Custom chain signing" severity="warning">
          <Text>
            <Bold>Warning:</Bold> You are signing this transaction for a custom chain. Make sure you trust this chain: <Italic>{chainId}</Italic>
          </Text>
        </Banner>}
        <Text>
          Confirm if you want to sign it using your:
        </Text>
        {KeyTypeNotice(...keys)}
      </Box>
    )
  }
});
