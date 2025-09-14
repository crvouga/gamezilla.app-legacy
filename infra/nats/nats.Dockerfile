# Use the official NATS server image
FROM nats:2.10-alpine

# Copy the NATS configuration file
COPY nats.conf /etc/nats/nats.conf

# Expose NATS ports
EXPOSE 4222 6222 8222 7777

# Set the working directory (stateless)
WORKDIR /

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8222/healthz || exit 1

# Run NATS server with the configuration
CMD ["/usr/local/bin/nats-server", "-c", "/etc/nats/nats.conf"]
