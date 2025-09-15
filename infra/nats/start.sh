#!/bin/sh

# Substitute environment variables in the NATS configuration
envsubst < /etc/nats/nats.conf > /tmp/nats.conf

# Start NATS server with the substituted configuration
exec /usr/local/bin/nats-server -c /tmp/nats.conf
