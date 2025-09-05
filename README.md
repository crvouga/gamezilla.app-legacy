# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- frontend (www.gamezilla.app)
  - local first spa on cloudflare pages cdn
  - dependencies: backend, topic
  - infra: [cloudflare pages](https://dash.cloudflare.com/2698e76355a8c8d1ee21e15fa9fd44f7/workers-and-pages)

- backend (backend.gamezilla.app)
  - stateless rpc/worker server. single region. many replicas. next to database
  - single region replicas
  - dependencies: topic, postgresql
  - infra: railway

- postgresql (internal)
  - stateful database
  - managed
  - no dependencies
  - infra: [neon](https://console.neon.tech/app/projects/divine-sky-66973925)

- nats (nats.gamezilla.app)
  - stateless message broker for distributing messages between topic server replicas
  - managed
  - no dependencies
  - infra: fly.io
