import { Bold, Text, Box, Italic } from "@metamask/snaps-sdk/jsx";

export const ConfirmAiStoreKey = async (
  origin: string,
  providerName: string,
  label?: string
) =>
  snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: (
        <Box>
          <Text>
            <Bold>{origin}</Bold> asked to store an API key for{" "}
            <Bold>{providerName}</Bold>
          </Text>
          {label === undefined ? null : (
            <Text>
              Label: <Italic>{label}</Italic>
            </Text>
          )}
          <Text>
            The key stays inside this snap. Only this site can use it, and every
            call it makes with the key needs your approval.
          </Text>
        </Box>
      )
    }
  });
