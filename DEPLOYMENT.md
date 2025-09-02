# Gamezilla Topic Service - Fly.io Deployment Guide

This guide covers deploying the Gamezilla Topic Service to Fly.io with multi-region support.

## Prerequisites

1. Install Fly.io CLI: `curl -L https://fly.io/install.sh | sh`
2. Login to Fly.io: `fly auth login`
3. Set up your secrets (see below)

## Environment Variables & Secrets

The topic service requires the following environment variables:

### Required Secrets (set via `fly secrets set`)

```bash
# NATS connection (for pub/sub)
fly secrets set NATS_URL="nats://your-nats-cluster:4222"

# Database connection (if using SQL-based pub/sub)
fly secrets set DATABASE_URL="postgresql://user:pass@host:5432/db"

# Topic service URL (for client connections)
fly secrets set TOPIC_URL="https://topic.gamezilla.app"
```

### Optional Environment Variables

```bash
# Set via fly.toml or fly secrets set
fly secrets set NODE_ENV="production"
fly secrets set TOPIC_PORT="8080"
```

## Deployment Commands

### Deploy to Production

```bash
# Deploy to production
pnpm topic:deploy

# Or deploy manually
fly deploy
```

### Multi-Region Setup

```bash
# Deploy to multiple regions for global coverage
fly scale count 2 --region iad    # US East (Virginia)
fly scale count 2 --region lhr    # Europe (London)
fly scale count 2 --region nrt    # Asia (Tokyo)
fly scale count 2 --region syd    # Australia (Sydney)
```

### Monitoring & Management

```bash
# View logs
pnpm topic:logs

# Check status
fly status

# Scale up/down
fly scale count 3 --region iad

# SSH into instance
fly ssh console

# View metrics
fly dashboard
```

## Architecture

- **Primary Region**: `iad` (US East)
- **Multi-Region**: Deploy to multiple regions for global coverage
- **Load Balancing**: Fly.io automatically handles load balancing across regions
- **WebSocket Support**: Configured for WebSocket connections with connection limits
- **Health Checks**: HTTP health checks on `/health` endpoint
- **Auto-scaling**: Based on connection count (800 soft, 1000 hard limit)
- **Single Environment**: Production only

## Custom Domain Setup

1. Add your domain to Fly.io:

```bash
fly certs add topic.gamezilla.app
```

2. Update DNS to point to Fly.io:

```
CNAME topic.gamezilla.app gamezilla-topic.fly.dev
```

## Troubleshooting

### Common Issues

1. **Health check failures**: Ensure `/health` endpoint is responding
2. **WebSocket connection issues**: Check connection limits and NATS connectivity
3. **Memory issues**: Monitor memory usage and scale up if needed

### Debug Commands

```bash
# View detailed logs
fly logs --app gamezilla-topic

# Check app status
fly status --app gamezilla-topic

# View app info
fly info --app gamezilla-topic
```

## Security

- All traffic is automatically HTTPS
- Secrets are encrypted and stored securely
- Health checks use HTTP (internal only)
- WebSocket connections are secured via TLS
