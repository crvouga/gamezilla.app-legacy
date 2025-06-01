import { NonEmpty } from '~/@/array/non-empty'
import { EventSourced } from '~/@/event-sourced'
import { withEventId, withEventMetaAt } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { loggerNoop } from '~/@/logger/impl-noop'
import { PhoneNumber } from '~/@/phone-number'
import { RPC } from '~/@/rpc'
import type { Screen } from '~/@/screen/generated/screens'
import { Posix } from '~/@/time/posix'
import { Topic } from '~/@/topic'
import { SessionId } from '~/@/wire/session-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { Space } from '../../spaces-core/space'
import { SpacesFrontend } from '../../frontend'
import * as SpacesTypes from '../../types'

export const SpaceFrontendFixture = async () => {
  const f = await FixtureAppFrontend()

  type Msg = {
    t: 'msg'
    c: SpacesTypes.MsgFrontend
  }

  const topic = Topic.initClient({
    t: 'local',
    contract: SpacesTypes.topicContract,
    logger: loggerNoop,
  })

  const rpc = RPC.initClient({
    t: 'local',
    contract: SpacesTypes.rpcContract,
    clientSessionId: f.ctx.clientSessionId,
    sessionId: SessionId.generate(),
    server: {
      'spaces.sync.sync': async (input) => {
        return {
          space: input.space,
        }
      },
      'spaces.list-spaces.list': async (_input) => {
        return {
          spaces: [],
        }
      },
    },
  })

  const ctx: SpacesTypes.FrontendCtxModule = {
    ...f.ctx,
    topic,
    rpc,
  }

  const updates = (initial: SpacesTypes.ModelFrontend, msgs: Msg[]) => {
    const outputs: ReturnType<typeof SpacesFrontend.update>[] = []
    for (const msg of msgs) {
      switch (msg.t) {
        case 'msg': {
          const output = SpacesFrontend.update({ ctx, model: initial, msg: msg.c })
          outputs.push(output)
          break
        }
      }
    }
    return outputs
  }

  return {
    ...f,
    updates,
  }
}

export type FixtureInput = Partial<Parameters<typeof SpacesFrontend.update>[0]>

export type Output = ReturnType<typeof SpacesFrontend.update>

export const FixtureSpacesFrontend = async (input?: { currentScreen?: Screen }) => {
  const f = await FixtureAppFrontend(input)
  const currentUser: UserAccount = {
    userId: f.ctx.currentUser.userId,
    createdAt: Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
  }
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
        withEventId({ t: 'user-started-space', spaceId, userId: currentUser.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userA.id } as const),
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
    (model) => Space.toSpaceStarted(model),
    (space) => {
      if (!space) {
        throw new Error('Invalid fixture. Space is not started.')
      }
      return space
    },
  )

  const topic = Topic.initClient({
    t: 'local',
    contract: SpacesTypes.topicContract,
    logger: loggerNoop,
  })

  const rpc = RPC.initClient({
    t: 'local',
    contract: SpacesTypes.rpcContract,
    clientSessionId: f.ctx.clientSessionId,
    sessionId: SessionId.generate(),
    server: {
      'spaces.sync.sync': async (input) => {
        return {
          space: input.space,
        }
      },
      'spaces.list-spaces.list': async (_input) => {
        return {
          spaces: [],
        }
      },
    },
  })

  const currentUserProfile = await UserProfile.random({ id: currentUser.userId })
  const ctx: SpacesTypes.FrontendCtxModule = {
    ...f.ctx,
    parentScreen: null,
    currentScreen: {
      n: 'spaces',
      t: 'space-list',
    },
    currentUserId: currentUser.userId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profilesByUserId: UserProfile.indexByUserId([currentUserProfile, userA, userB, userC]),
    space,
    currentUser,
    topic,
    rpc,
  }

  const updates = (initial: Output, inputs: FixtureInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      let output = SpacesFrontend.update({
        ...input,
        ctx: input.ctx ?? ctx,
        model: NonEmpty.last(outputs).model,
      })
      const msgOuts: unknown[] = []

      for (const msgOut of output.msgOut ?? []) {
        msgOuts.push(msgOut)
        output = SpacesFrontend.update({
          ctx: input.ctx ?? ctx,
          model: output.model,
          msgIn: msgOut,
        })
      }

      outputs.push({
        ...output,
        msgOut: msgOuts,
      })
    }
    return outputs
  }

  const update = (initial: Output, inputs: FixtureInput[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const view = (input: { model: SpacesTypes.ModelFrontend }) => {
    return f.render(<SpacesFrontend.View ctx={ctx} dispatch={() => {}} {...input} />)
  }

  const initial = SpacesFrontend.init({ ctx })

  return {
    ...f,
    hostId: currentUser.userId,
    ctx,
    initial,
    currentUser,
    userA,
    userB,
    userC,
    updates,
    update,
    view,
  }
}

export const userStartedSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msg: {
      t: 'sync.got-msg-space',
      c: withEventMetaAt(happenedAt, {
        t: 'user-started-space',
        spaceId,
        userId,
      }),
    },
  }
}

export const userLeftSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msg: {
      t: 'sync.got-msg-space',
      c: withEventMetaAt(happenedAt, {
        t: 'user-left-space',
        spaceId,
        userId,
      }),
    },
  }
}

export const userJoinedSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msg: {
      t: 'sync.got-msg-space',
      c: withEventMetaAt(happenedAt, {
        t: 'user-joined-space',
        spaceId,
        userId,
      }),
    },
  }
}
