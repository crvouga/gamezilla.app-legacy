import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { FrontendId } from '~/app/@/data/frontend-id'
import { Profile } from '~/app/@/data/profile'
import { SessionId } from '~/app/@/data/session-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpacesCoreBackend } from '../../core/backend'
import { SpaceCore } from '../../core/space-core'
import { GamesBackend } from '../../game/games/backend'
import { SpacesBackend } from '../../backend'
import { BackendCtx } from '../../types'
import { SpaceBackendCtx } from '../space-backend/ctx'

export const FixtureSpaceBackend = async () => {
  const f = await FixtureAppBackend()

  const frontendA = randomAuthenticatedFrontend()
  const frontendB = randomAuthenticatedFrontend()
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
        withEventId({ t: 'user-started-space', spaceId, userId: userA.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userB.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userC.userId } as const),
      ),
  )

  const spaceState = SpaceCore.toSpaceStarted(space)

  if (!spaceState) {
    throw new Error('Invalid fixture. Space is not started.')
  }

  const ctx: SpaceBackendCtx = {
    ...f.ctx,
    space: spaceState,
  }

  const backendCtx: BackendCtx = {
    ...f.ctx,
    spacesCoreBackend: await SpacesCoreBackend({
      t: 'db-conn-kv',
      dbConnKv: f.ctx.dbConnKv,
      logger: f.ctx.logger,
      runtime: f.ctx.runtime,
    }),
    games: await GamesBackend.initCtx({
      ...f.ctx,
      ctx: {
        ...f.ctx,
        space: spaceState,
      },
    }),
  }

  type Input = Partial<Parameters<typeof SpacesBackend.update>[0]>
  type Output = Awaited<ReturnType<typeof SpacesBackend.update>>

  const updates = async (inputs: Input[]) => {
    const outputs: Output[] = []
    for (const input of inputs) {
      const output = await SpacesBackend.update({
        ...input,
        ctx: input.ctx ?? backendCtx,
        deps: null,
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
    backendCtx,
    frontendA,
    frontendB,
    update,
  }
}

export const randomAuthenticatedFrontend = (): AuthenticatedFrontend => {
  return {
    frontendId: FrontendId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate(),
  }
}

export type AuthenticatedFrontend = {
  frontendId: FrontendId
  sessionId: SessionId
  userId: UserId
}
