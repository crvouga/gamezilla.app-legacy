# NATS Server for Gamezilla

Minimal NATS server setup for Railway deployment with WebSocket support.

## Files

- `nats.conf` - NATS server configuration with WebSocket support
- `nats.Dockerfile` - Docker image definition
- `start.sh` - Startup script with conditional authentication
- `railway.json` - Railway deployment configuration

## Features

- Single-node NATS server
- WebSocket client support on port 9222
- Standard NATS client port 4222
- Monitoring on port 8222
- Optional authentication (can be disabled)

## Security & Authentication

**No hardcoded credentials** - Authentication is optional and controlled by environment variables:

- **With Authentication** (Production): Set `NATS_USER` and `NATS_PASS` environment variables
- **Without Authentication** (Development): Leave environment variables unset

### Production Setup

```bash
# Set these environment variables in Railway or Docker
NATS_USER=your_secure_username
NATS_PASS=your_secure_password
```

### Development Setup

```bash
# No environment variables needed - runs without authentication
docker run -p 4222:4222 -p 9222:9222 -p 8222:8222 gamezilla-nats
```

## Deployment

### Railway

1. Connect your repository to Railway
2. Deploy from the `infra/nats` directory

### Docker

1. Build the image:

   ```bash
   docker build -f nats.Dockerfile -t gamezilla-nats .
   ```

2. Run the container:

   **Development (no auth):**

   ```bash
   docker run -p 4222:4222 -p 9222:9222 -p 8222:8222 gamezilla-nats
   ```

   **Production (with auth):**

   ```bash
   docker run -e NATS_USER=your_user -e NATS_PASS=your_password \
     -p 4222:4222 -p 9222:9222 -p 8222:8222 gamezilla-nats
   ```

## WebSocket Connection

WebSocket clients can connect to `ws://your-domain:9222` for NATS over WebSocket connections.

## Configuration

The NATS server includes:

- WebSocket support on port 9222
- Standard NATS port 4222
- Monitoring on port 8222
- CORS enabled for WebSocket connections
- Optional user authentication
