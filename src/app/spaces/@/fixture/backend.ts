import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { ClientId } from '~/app/@/data/client-id'
import { Profile } from '~/app/@/data/profile'
import { SessionId } from '~/app/@/data/session-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpacesCoreAsync } from '../../core/core-async'
import { Space } from '../../core/space'
import { GamesBackend } from '../../game/games/backend'
import { SpacesBackend } from '../../backend'
import { BackendCtx } from '../../types'
import { SpaceBackendCtx } from '../backend/ctx'
import { TimeSpan } from '~/@/time/time-span'

export const FixtureSpaceBackend = async () => {
  const f = await FixtureAppBackend()

  const frontendA = randomAuthenticatedFrontend()
  const frontendB = randomAuthenticatedFrontend()
  const userA = await Profile.random()
  const userB = await Profile.random()
  const userC = await Profile.random()

  const spaceId = SpaceId.generate()

  const space = pipe(
    Space.init,
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-started-space', spaceId, userId: userA.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userB.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userC.userId } as const),
      ),
  )

  const spaceState = Space.toSpaceStarted(space)

  if (!spaceState) {
    throw new Error('Invalid fixture. Space is not started.')
  }

  const ctx: SpaceBackendCtx = {
    ...f.ctx,
    space: spaceState,
  }

  const backendCtx: BackendCtx = {
    ...f.ctx,
    spacesCore: await SpacesCoreAsync({
      t: 'db-conn-kv',
      keyValueDb: f.ctx.keyValueDb,
      logger: f.ctx.logger,
      runtime: f.ctx.runtime,
      writeThrottle: TimeSpan.milliseconds(0),
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
    clientId: ClientId.generate(),
    sessionId: SessionId.generate(),
    userId: UserId.generate(),
  }
}

export type AuthenticatedFrontend = {
  clientId: ClientId
  sessionId: SessionId
  userId: UserId
}
