# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- frontend-web (www.gamezilla.app)
  - local first single page app served from cloudflare pages cdn

- backend-rpc
  - stateless rpc server. single region. many replicas. next to database

- backend-topic
  - pub/sub topic server for real-time communication.
  - many independent islands with their own URL

- backend-worker
  - background task processor. many replicas, next to database

- postgres
  - stateful database
  - managed
