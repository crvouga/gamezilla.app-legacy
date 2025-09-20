FROM nats:2.10-alpine

# Copy configuration and start script
COPY nats.conf /etc/nats/nats.conf
COPY start.sh /start.sh

# Make start script executable
RUN chmod +x /start.sh

# Expose ports: 4222 (NATS), 9222 (WebSocket), 8222 (monitoring)
EXPOSE 4222 9222 8222

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8222/healthz || exit 1

# Start NATS server with conditional authentication
CMD ["/start.sh"]
