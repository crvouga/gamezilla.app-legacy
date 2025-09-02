# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- Frontend (www.gamezilla.app)
  - Local first SPA on Cloudflare Pages CDN
  - Dependencies: Backend, Topic
  - Infra: [Cloudflare Pages](https://dash.cloudflare.com/2698e76355a8c8d1ee21e15fa9fd44f7/workers-and-pages)

- Backend (backend.gamezilla.app)
  - Stateless RPC/worker server
  - Single region replicas
  - Dependencies: Topic, PostgreSQL
  - Infra: [Railway](https://railway.com/project/a382e0f0-8e9a-408b-80d9-223a225ca59c/service/734ff343-6358-4d81-9ded-59ac04740e50?environmentId=00dfa594-64e5-4bf9-bb05-5bb3018466e2)

- PostgreSQL (internal)
  - Stateful database
  - Managed
  - No dependencies
  - Infra: [Neon](https://console.neon.tech/app/projects/divine-sky-66973925)
  -
- Topic (topic.gamezilla.app)
  - Stateless WebSocket server for topic based pub sub
  - No business logic just plumbing
  - Multi-region replicas
  - Dependencies: NATS
  - Infra: [Fly.io](https://fly.io/apps/gamezilla-app)

- NATS (internal)
  - Stateless message broker for distributing messages between topic server replicas
  - Managed
  - No business logic just plumbing
  - No dependencies
  - Infra: [Railway](https://railway.com/project/a382e0f0-8e9a-408b-80d9-223a225ca59c/service/63f1b307-b710-4d12-9a2c-446349a31f72?environmentId=00dfa594-64e5-4bf9-bb05-5bb3018466e2)
