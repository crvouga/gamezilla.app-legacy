# Gamezilla Cloudflare Worker

This is a minimal Cloudflare Worker setup for the Gamezilla project, separate from the existing SPA CDN configuration.

## Features

- Health check endpoint (`/health`)
- Example API endpoint (`/api/hello`)
- CORS support
- TypeScript support
- Separate configuration from the main SPA

## Development

```bash
# Start local development server
pnpm worker:dev

# Deploy to Cloudflare
pnpm worker:deploy

# Deploy to staging environment
pnpm worker:deploy:staging

# View real-time logs
pnpm worker:tail
```

## Configuration

The worker configuration is in `wrangler.toml`. This is separate from the main `wrangler.json` which handles the SPA CDN.

## Environment Variables

Add environment variables in `wrangler.toml` under the `[vars]` section, or use secrets:

```bash
# Set secrets
wrangler secret put API_KEY
```

## Routes

Configure custom routes in `wrangler.toml` by uncommenting and modifying the routes section.
