#!/bin/bash
set -e

if [ -z "$GITHUB_RUNNER_TOKEN" ] || [ -z "$GITHUB_RUNNER_URL" ]; then
  echo "GITHUB_RUNNER_TOKEN and GITHUB_RUNNER_URL must be set"
  exit 1
fi

# Configure the runner
./config.sh --unattended \
  --url "$GITHUB_RUNNER_URL" \
  --token "$GITHUB_RUNNER_TOKEN" \
  --name "$(hostname)" \
  --labels self-hosted \
  --work _work

# Run the runner
exec ./run.sh