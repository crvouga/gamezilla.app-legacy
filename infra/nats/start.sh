#!/bin/sh
echo "Starting NATS server..."

TEMP_CONFIG="/tmp/nats.conf"
cp /etc/nats/nats.conf "$TEMP_CONFIG"

# Use Railway's PORT environment variable for monitoring if set, otherwise use default 8222
MONITOR_PORT=${PORT:-8222}
echo "Using monitor port: $MONITOR_PORT"

# Update the config to use the Railway PORT for monitoring
sed -i "s/monitor_port: 8222/monitor_port: $MONITOR_PORT/" "$TEMP_CONFIG"
sed -i "s/http_port: 8222/http_port: $MONITOR_PORT/" "$TEMP_CONFIG"

if [ -n "$NATS_USER" ] && [ -n "$NATS_PASS" ]; then
  echo "Enabling NATS authentication for user: $NATS_USER"
  cat >> "$TEMP_CONFIG" << EOF

authorization {
  users = [
    {
      user: "$NATS_USER"
      password: "$NATS_PASS"
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

echo "Final NATS configuration:"
cat "$TEMP_CONFIG"

echo "Starting NATS server with config: $TEMP_CONFIG"
exec /usr/local/bin/nats-server -c "$TEMP_CONFIG"
