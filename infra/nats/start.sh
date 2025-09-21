#!/bin/sh
echo "Starting NATS server..."

TEMP_CONFIG="/tmp/nats.conf"
cp /etc/nats/nats.conf "$TEMP_CONFIG"

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
