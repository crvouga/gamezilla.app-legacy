#!/bin/sh

echo "Starting NATS server..."

# Create a temporary config file
TEMP_CONFIG="/tmp/nats.conf"
cp /etc/nats/nats.conf "$TEMP_CONFIG"

# Add authentication if credentials are provided
if [ -n "$NATS_USER" ] && [ -n "$NATS_PASSWORD" ]; then
  echo "Enabling NATS authentication for user: $NATS_USER"
  cat >> "$TEMP_CONFIG" << EOF

authorization {
  users = [
    {
      user: "$NATS_USER"
      password: "$NATS_PASSWORD"
      permissions: {
        publish: ">"
        subscribe: ">"
      }
    }
  ]
}
EOF
else
  echo "Running NATS server without authentication (development mode)"
fi

# Show the final config for debugging
echo "Final NATS configuration:"
cat "$TEMP_CONFIG"

# Start NATS server with the configuration
echo "Starting NATS server with config: $TEMP_CONFIG"
exec /usr/local/bin/nats-server -c "$TEMP_CONFIG"
