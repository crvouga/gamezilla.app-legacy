# gamezilla.app

[![Deployment Pipeline](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml/badge.svg)](https://github.com/crvouga/gamezilla.app/actions/workflows/deployment-pipeline.yml)

## Architecture

- frontend - www.gamezilla.app - stateless static file server for local-first single page app with multi region replicas. depends on backend and topic
- backend - backend.gamezilla.app - stateless rpc/worker server with single region replicas. depends topic and postgres
- topic - topic.gamezilla.app - stateless websocket with multi region replicas. depends on nats
- postgres - internal private url - stateful postgres database with single region single node. depends on nothing
- nats - internal private url - stateless nats server with single region single node. depends on nothing
