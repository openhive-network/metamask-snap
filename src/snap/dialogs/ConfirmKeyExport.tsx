import {
  Bold,
  Text,
  Box,
  Banner
} from "@metamask/snaps-sdk/jsx";

import { KeyTypeNotice } from "./components/KeyTypeNotice";
import type { KeyIndex } from "../../rpc";

export const ConfirmKeyExport = async (
  origin: string,
  keys: KeyIndex[]
) =>
  snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: (
        <Box>
          <Banner title="Private key export" severity="warning">
            <Text>
              <Bold>Warning:</Bold> You are about to export your Hive private
              keys. Never share your private keys with anyone. Make sure you
              trust <Bold>{origin}</Bold> before proceeding.
            </Text>
          </Banner>
          <Text>
            <Bold>{origin}</Bold> is requesting access to your:
          </Text>
          {KeyTypeNotice(...keys)}
          <Text>
            These keys provide full control over the corresponding permissions
            on your Hive account. Store them securely.
          </Text>
        </Box>
      )
    }
  });
