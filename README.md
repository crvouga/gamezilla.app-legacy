# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- Frontend (www.gamezilla.app)
  - Stateless static file server for local-first SPA
  - Multi-region replicas
  - Dependencies: Backend, Topic

- Backend (backend.gamezilla.app)
  - Stateless RPC/worker server
  - Single region replicas
  - Dependencies: Topic, PostgreSQL

- Topic (topic.gamezilla.app)
  - Stateless WebSocket server
  - Multi-region replicas
  - Dependencies: NATS

- PostgreSQL (internal)
  - Stateful database
  - Single region, single node
  - No dependencies

- NATS (internal)
  - Stateless message broker
  - Single region, single node
  - No dependencies
