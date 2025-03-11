#!/bin/bash

set -e

SCRIPT_PATH=$(dirname $(readlink -f $0))
SNAP_PATH=$(dirname $SCRIPT_PATH)
datetime=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="${SNAP_PATH}/snapper_${datetime}.log.json"

# Run snapper
pnpm exec snapper -p "${SNAP_PATH}" --output "${LOG_FILE}"

# Display simplified human-readable report and exit with error code if any issues found
if [ -f "${LOG_FILE}" ]; then
  jq -r 'to_entries[] | .value[] | "\(.position.filePath):\(.position.lineNum):\n\(.type): \(.description)\n"' "${LOG_FILE}"
  exit 1
fi;
