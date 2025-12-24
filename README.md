# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- frontend (www.gamezilla.app)
  - local first single page app served from cloudflare pages cdn
  - infra: [cloudflare pages](https://dash.cloudflare.com/2698e76355a8c8d1ee21e15fa9fd44f7/workers-and-pages)

- backend
  - stateless rpc/worker server. single region. many replicas. next to database
  - single region replicas
  - dependencies: postgres
  - infra: fly.io

- postgres
  - stateful database
  - managed
  - no dependencies
  - infra: [neon](https://console.neon.tech/app/projects/divine-sky-66973925)
