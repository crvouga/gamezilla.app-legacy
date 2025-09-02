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
  - infra: fly.io

- postgresql (internal)
  - stateful database
  - managed
  - no dependencies
  - infra: [neon](https://console.neon.tech/app/projects/divine-sky-66973925)

- topic (topic.gamezilla.app)
  - stateless web socket server for topic based pub sub. many regions. many replicas
  - no business logic just plumbing
  - multi-region replicas
  - dependencies: nats
  - infra: [fly.io](https://fly.io/apps/gamezilla-app)

- nats (internal)
  - stateless message broker for distributing messages between topic server replicas
  - managed
  - no business logic just plumbing
  - no dependencies
  - infra: fly.io
