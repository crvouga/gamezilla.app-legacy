import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { TimeSpan } from '~/@/time/time-span'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpacesBackend } from '../../backend'
import { SpacesCoreAsync } from '../../core/core-async'
import { Space } from '../../core/space'
import { GamesBackend } from '../../game/games/backend'
import { SpaceBackendCtxModule } from '../../types'
import { SpaceBackendCtx } from '../backend/ctx'
import { UserProfile } from '~/app/@/data/user-profile'
import { Topic } from '~/@/topic'
import { SpacesTypes } from '../..'

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
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-started-space', spaceId, userId: userA.id } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userB.id } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userC.id } as const),
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

  const topic = Topic.initClient({
    t: 'local',
    contract: SpacesTypes.topicContract,
    logger: f.ctx.logger,
  })

  const backendCtx: SpaceBackendCtxModule = {
    ...f.ctx,
    spacesCore: await SpacesCoreAsync({
      t: 'key-value-db',
      keyValueDb: f.ctx.keyValueDb,
      logger: f.ctx.logger,
      runtime: f.ctx.runtime,
      writeThrottle: TimeSpan.milliseconds(0),
      namespace: [],
    }),
    topic,
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
    clientSessionId: ClientSessionId.generate(),
  }
}

export type AuthenticatedFrontend = {
  clientId: ClientId
  sessionId: SessionId
  userId: UserId
  clientSessionId: ClientSessionId
}
