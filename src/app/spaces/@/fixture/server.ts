import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { ClientId } from '~/app/@/data/client-id'
import { Profile } from '~/app/@/data/profile'
import { SessionId } from '~/app/@/data/session-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppServer } from '~/app/@/server/fixture'
import { SpacesCoreServer } from '../../core/server'
import { SpaceCore } from '../../core/space-core'
import { GamesServer } from '../../games/server'
import { SpacesServer } from '../../server'
import { ServerCtx } from '../../types'
import { SpaceServerCtx } from '../space-server/ctx'

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
  }

  const serverCtx: ServerCtx = {
    ...f.ctx,
    spacesCoreServer: await SpacesCoreServer({
      t: 'db-conn-kv',
      dbConnKv: f.ctx.dbConnKv,
      logger: f.ctx.logger,
      runtime: f.ctx.runtime
    }),
    games: await GamesServer.initCtx({
      ...f.ctx,
      ctx: {
        ...f.ctx,
        space: spaceState
      }
    })
  }

  type Input = Partial<Parameters<typeof SpacesServer.update>[0]>
  type Output = Awaited<ReturnType<typeof SpacesServer.update>>

  const updates = async (inputs: Input[]) => {
    const outputs: Output[] = []
    for (const input of inputs) {
      const output = await SpacesServer.update({
        ...input,
        ctx: input.ctx ?? serverCtx,
        deps: null
      })
      outputs.push(output)
    }
    return outputs
  }
  const update = async (inputs: Input[]): Promise<Output> => {
    const outputs = await updates(inputs)
    return outputs[outputs.length - 1] ?? {}
  }

  return {
    ...f,
    ctx,
    serverCtx,
    clientA,
    clientB,
    update
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
