# NATS Super Cluster Deployment (Stateless)

This directory contains the configuration files for deploying a stateless NATS super cluster to Fly.io as a single app called `gamezilla-app-nats`. This configuration does not use persistent storage or JetStream.

## Files

- `fly.toml` - Fly.io deployment configuration
- `nats.Dockerfile` - Docker image configuration for NATS server
- `nats.conf` - NATS server configuration file

## Deployment

To deploy the NATS super cluster to Fly.io:

1. **Initialize the Fly.io app** (first time only):

   ```bash
   cd infra/nats
   fly apps create gamezilla-app-nats
   ```

2. **Deploy the application**:
   ```bash
   fly deploy
   ```

## Configuration

The NATS server is configured with:

- **Port 4222**: Client connections
- **Port 6222**: Cluster connections
- **Port 8222**: HTTP monitoring
- **Port 7777**: Gateway connections
- **Stateless Operation**: No persistent storage or JetStream
- **Authentication**: Basic user authentication (change password in production)
- **Clustering**: Ready for super cluster expansion

## Security Notes

⚠️ **Important**: Before deploying to production:

1. Change the password in `nats.conf` (currently set to a placeholder)
2. Consider enabling TLS encryption
3. Update cluster and gateway routes as needed
4. Review and adjust connection limits

## Monitoring

The NATS server exposes a monitoring endpoint at:

- `https://gamezilla-app-nats.fly.dev:8222/varz` - Server variables
- `https://gamezilla-app-nats.fly.dev:8222/healthz` - Health check

## Scaling

To add more nodes to the super cluster:

1. Update the `routes` array in `nats.conf` with other NATS instances
2. Update the `gateways` array for cross-cluster communication
3. Redeploy the application
