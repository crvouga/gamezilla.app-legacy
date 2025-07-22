#!/bin/bash
set -e

# Start Docker daemon in the background
dockerd &
sleep 3 # Give docker some time to start

# Register binfmt handlers for multi-platform support
docker run --rm --privileged tonistiigi/binfmt --install all

if [ -z "$GITHUB_RUNNER_TOKEN" ]; then
  echo "GITHUB_RUNNER_TOKEN must be set"
  exit 1
fi

# Set default URL if not provided
if [ -z "$GITHUB_RUNNER_URL" ]; then
  echo "GITHUB_RUNNER_URL must be set"
  exit 1
fi

# The runner agent should not run as root.
# We'll run it as the 'runner' user.
# First, chown the home directory to the runner user.
chown -R runner:runner /home/runner

# Configure the runner as the 'runner' user, preserving environment variables
su -p -s /bin/bash runner -c './config.sh --unattended \
  --url "$GITHUB_RUNNER_URL" \
  --token "$GITHUB_RUNNER_TOKEN" \
  --name "$(hostname)" \
  --labels self-hosted \
  --work _work'

# Run the runner as the 'runner' user
exec su -p -s /bin/bash runner -c './run.sh'