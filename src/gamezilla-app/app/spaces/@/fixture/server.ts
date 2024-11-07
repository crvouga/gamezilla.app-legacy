import { pipe, Posix } from '@/core'
import { EventSourced } from '@/event-sourced'
import { EventId, withEventId } from '@/event-sourced/event'
import { LamportTimestamp } from '@/lamport-clock'
import { ClientId, Profile, SessionId, SpaceId, UserId } from 'gamezilla-app/app/@/data'
import type { AppServerCtx } from 'gamezilla-app/app/@/server'
import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { DbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { PubSubTopicBased } from 'gamezilla-app/app/@/server/pub-sub-topic-based'
import { FixtureAppServer } from 'gamezilla-app/app/@/server/server-test-env'
import { smsNoop } from 'gamezilla-app/app/@/server/sms'
import { ProfileCache } from '../../../@/server/profile-cache'
import { SpaceCore } from '../../core'
import { SpacesCoreServer } from '../../core/server'
import { GamesServer } from '../../games/server'
import * as SpacesServer from '../../server'
import type { ServerDeps } from '../../types'
import { SpaceServerCtx } from '../space-server-ctx'
import { Runtime } from '@/runtime'
import { WebServer } from '@/web-server'
import { ServerInstanceId } from 'gamezilla-app/app/@/server/server-instance/server-instance-id'

export const FixtureSpaceServer = async () => {
  const f = await FixtureAppServer()
  const deps = await initDeps()
  const clientA = randomAuthenticatedClient()
  const clientB = randomAuthenticatedClient()
  const userA = await Profile.random()
  const userB = await Profile.random()
  const userC = await Profile.random()

  const spaceId = SpaceId.generate()

  const space = pipe(
    SpaceCore.init,
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-started-space', spaceId, userId: userA.userId } as const)
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userB.userId } as const)
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userC.userId } as const)
      )
  )

  const spaceState = SpaceCore.toSpaceStarted(space)

  if (!spaceState) {
    throw new Error('Invalid fixture. Space is not started.')
  }

  const ctx: SpaceServerCtx = {
    ...f.ctx,
    space: spaceState
  }

  return {
    ...f,
    deps,
    ctx,
    clientA,
    clientB
  }
}

export const ctx: AppServerCtx = {
  sleep: async () => null,
  env: 'test',
  sms: smsNoop,
  dbConnSql: await DbConnSql({ t: 'noop' }),
  logger: Logger({ t: 'noop' }),
  now: Posix.now(),
  dbConnKv: await DbConnKv({ t: 'hash-map' }),
  pubSub: await PubSubTopicBased({ t: 'noop' }),
  profileCache: await ProfileCache({ t: 'in-memory' }),
  runtime: Runtime({ t: 'noop' }),
  server: WebServer({ t: 'bun', logger: Logger({ t: 'noop' }) }),
  serverInstanceId: ServerInstanceId.generate()
}

export const initDeps = async (): Promise<ServerDeps> => {
  const dbConnKv = await DbConnKv({ t: 'hash-map' })
  return {
    spacesCoreServer: await SpacesCoreServer({
      t: 'db-conn-kv',
      dbConnKv,
      logger: Logger({ t: 'noop' }),
      runtime: Runtime({ t: 'noop' })
    }),
    games: GamesServer.initCtx({
      ctx: {
        ...ctx,
        space: {
          hostId: UserId.generate(),
          spaceId: SpaceId.generate(),
          users: {},
          visibility: 'public'
        }
      }
    })
  }
}

export const randomAuthenticatedClient = (): AuthenticatedClient => {
  return {
    clientId: ClientId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate()
  }
}

export type AuthenticatedClient = {
  clientId: ClientId
  sessionId: SessionId
  userId: UserId
}

export const userStartedSpace = (deps: ServerDeps, client: AuthenticatedClient, spaceId: SpaceId) => () => {
  return SpacesServer.update({
    ctx,
    deps,
    msgClient: {
      t: 'got-msg-core',
      clientId: client.clientId,
      sessionId: client.sessionId,
      c: {
        t: 'user-started-space',
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(0),
        spaceId,
        userId: client.userId
      }
    }
  })
}

export const userJoinedSpace = (deps: ServerDeps, client: AuthenticatedClient, spaceId: SpaceId) => () => {
  return SpacesServer.update({
    ctx,
    deps,
    msgClient: {
      t: 'got-msg-core',
      clientId: client.clientId,
      sessionId: client.sessionId,
      c: {
        t: 'user-joined-space',
        eventId: EventId.generate(),
        happenedAt: LamportTimestamp.fromNumber(1),
        spaceId,
        userId: client.userId
      }
    }
  })
}

export const authenticatedClientConnected = (deps: ServerDeps, client: AuthenticatedClient) => () => {
  return SpacesServer.update({
    ctx,
    deps,
    msgEvt: {
      t: 'auth/client-authenticated',
      clientId: client.clientId,
      sessionId: client.sessionId,
      user: {
        createdAt: Posix.now(),
        role: 'guest',
        userId: client.userId,
        phoneNumber: null
      }
    }
  })
}

export const clientCore = (deps: ServerDeps, client: AuthenticatedClient, space: SpaceCore.Model) => () => {
  return SpacesServer.update({
    ctx,
    deps,
    msgClient: {
      t: 'sync',
      clientId: client.clientId,
      sessionId: client.sessionId,
      space
    }
  })
}
