# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- Frontend (www.gamezilla.app)
  - Stateless static file server for local-first SPA
  - Multi-region replicas
  - Dependencies: Backend, Topic
  - Infra: Cloudflare Pages

- Backend (backend.gamezilla.app)
  - Stateless RPC/worker server
  - Single region replicas
  - Dependencies: Topic, PostgreSQL
  - Infra: Railway

- Topic (topic.gamezilla.app)
  - Stateless WebSocket server
  - No business logic just plumbing
  - Multi-region replicas
  - Dependencies: NATS
  - Infra: Fly.io

- PostgreSQL (internal)
  - Stateful database
  - Managed
  - No dependencies
  - Infra: Neon

- NATS (internal)
  - Stateless message broker
  - Managed
  - No business logic just plumbing
  - No dependencies
  - Infra: Railway
