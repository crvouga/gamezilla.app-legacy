import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { Logger } from '~/@/logger'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { TopicClient } from '~/@/topic/topic-client/impl'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpacesTypes } from '../..'
import { GamesBackend } from '../../game/games/backend'
import { Space } from '../../space/space'
import { SpaceDb } from '../../space/space-db'
import { BackendCtxModule } from '../../types'
import { SpaceBackendCtx } from '../backend/ctx'

export const FixtureSpaceBackend = async () => {
  const f = await FixtureAppBackend()

  const frontendA = randomAuthenticatedFrontend()
  const frontendB = randomAuthenticatedFrontend()
  const userA = await UserProfile.random()
  const userB = await UserProfile.random()
  const userC = await UserProfile.random()

  const spaceId = SpaceId.generate()

  const space = pipe(
    Space.init,
    (model) => Space.append(model, withEventId({ t: 'userStartedSpace', spaceId, userId: userA.userId } as const)),
    (model) => Space.append(model, withEventId({ t: 'userJoinedSpace', spaceId, userId: userB.userId } as const)),
    (model) => Space.append(model, withEventId({ t: 'userJoinedSpace', spaceId, userId: userC.userId } as const)),
  )

  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) {
    throw new Error('Invalid fixture. Space is not started.')
  }

  const ctx: SpaceBackendCtx = { ...f.ctx }

  const topic = TopicClient.init({
    t: 'local',
    contract: SpacesTypes.topicContract,
    logger: f.ctx.logger,
  })

  const backendCtx: BackendCtxModule = {
    ...f.ctx,
    ...GamesBackend.initCtx({ ctx: f.ctx }),

    spaceDb: await SpaceDb({
      t: 'sql-db',
      sqlDb: f.ctx.sqlDb,
      logger: f.ctx.logger,
      migrationPolicy: SqlDbMigrationPolicy.init({ t: 'never-run', logger: Logger.init({ t: 'noop' }) }),
    }),
    topic,
  }

  return {
    ...f,
    ctx,
    backendCtx,
    frontendA,
    frontendB,
  }
}

export const randomAuthenticatedFrontend = (): AuthenticatedFrontend => {
  return {
    clientId: ClientId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate(),
    clientSessionId: ClientSessionId.generate(),
  }
}

export type AuthenticatedFrontend = {
  clientId: ClientId
  sessionId: SessionId
  userId: UserId
  clientSessionId: ClientSessionId
}
