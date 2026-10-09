import { Bold, Text, Box, Dropdown, Option } from "@metamask/snaps-sdk/jsx";

const ALLOW_FOR_FIELD = "allowForMinutes";
const ALLOW_FOR_MINUTES = [15, 60];

export type AiCallApproval = {
  approved: boolean;
  allowForMinutes: number;
};

export const ConfirmAiCall = async (
  origin: string,
  providerName: string,
  model: string | undefined
): Promise<AiCallApproval> => {
  const id = await snap.request({
    method: "snap_createInterface",
    params: {
      ui: (
        <Box>
          <Text>
            <Bold>{origin}</Bold> asked to call <Bold>{providerName}</Bold> with
            the API key it stored
          </Text>
          <Text>
            Model: <Bold>{model ?? "not specified"}</Bold>
          </Text>
          <Dropdown name={ALLOW_FOR_FIELD} value="0">
            <Option value="0">Ask me again next time</Option>
            {ALLOW_FOR_MINUTES.map((minutes) => (
              <Option value={String(minutes)}>
                {`Allow this site for ${minutes} minutes`}
              </Option>
            ))}
          </Dropdown>
        </Box>
      )
    }
  });

  const approved = await snap.request({
    method: "snap_dialog",
    params: { type: "confirmation", id }
  });
  if (approved !== true) {
    return { approved: false, allowForMinutes: 0 };
  }

  const state = await snap.request({
    method: "snap_getInterfaceState",
    params: { id }
  });
  const minutes = Number(state[ALLOW_FOR_FIELD]);

  return {
    approved: true,
    allowForMinutes: ALLOW_FOR_MINUTES.includes(minutes) ? minutes : 0
  };
};
