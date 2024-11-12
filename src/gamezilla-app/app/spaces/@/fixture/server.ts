import { pipe } from '@/core'
import { EventSourced } from '@/event-sourced'
import { withEventId } from '@/event-sourced/event'
import { ClientId, Profile, SessionId, SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { FixtureAppServer } from 'gamezilla-app/app/@/server/server-test-env'
import { SpaceCore } from '../../core'
import { SpaceServerCtx } from '../space-server-ctx'

export const FixtureSpaceServer = async () => {
  const f = await FixtureAppServer()

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
    // spacesCoreServer: await SpacesCoreServer({
    //   t: 'db-conn-kv',
    //   dbConnKv: f.ctx.dbConnKv,
    //   logger: f.ctx.logger,
    //   runtime: f.ctx.runtime
    // }),
    // games: await GamesServer.initCtx({
    //   ...f.ctx,
    //   ctx: {
    //     ...f.ctx,
    //     space: spaceState
    //   }
    // })
  }

  const updates = (input) => {
    SpaceServer
  }

  return {
    ...f,
    ctx,
    clientA,
    clientB
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
