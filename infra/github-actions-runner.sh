#!/bin/bash
set -e

if [ -z "$GITHUB_RUNNER_TOKEN" ]; then
  echo "GITHUB_RUNNER_TOKEN must be set"
  exit 1
fi

# Set default URL if not provided
GITHUB_RUNNER_URL=${GITHUB_RUNNER_URL:-"https://github.com/crvouga/gamezilla.app"}

# Configure the runner
./config.sh --unattended \
  --url "$GITHUB_RUNNER_URL" \
  --token "$GITHUB_RUNNER_TOKEN" \
  --name "$(hostname)" \
  --labels self-hosted \
  --work _work

# Run the runner
exec ./run.sh