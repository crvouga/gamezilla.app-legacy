import { NonEmpty } from '~/@/array/non-empty'
import { EventSourced } from '~/@/event-sourced'
import { withEventId, withEventMetaAt } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { PhoneNumber } from '~/@/phone-number'
import type { Screen } from '~/@/screen/generated/screens'
import { Posix } from '~/@/time/posix'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { SpacesFrontend } from '../../frontend'
import { Space } from '../../space/space'
import type * as SpacesTypes from '../../types'

export const SpaceFrontendFixture = async () => {
  const f = await FixtureAppFrontend()

  type Msg =
    | {
        t: 'msg'
        c: SpacesTypes.MsgFrontend
      }
    | {
        t: 'msg-backend'
        c: SpacesTypes.MsgToFrontend
      }

  const updates = (initial: SpacesTypes.ModelFrontend, msgs: Msg[]) => {
    const outputs: ReturnType<typeof SpacesFrontend.update>[] = []
    for (const msg of msgs) {
      switch (msg.t) {
        case 'msg': {
          const output = SpacesFrontend.update({
            ctx: f.ctx,
            model: initial,
            msg: msg.c,
          })
          outputs.push(output)
          break
        }
        case 'msg-backend': {
          const output = SpacesFrontend.update({
            ctx: f.ctx,
            model: initial,
            msgBackend: msg.c,
          })
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
    userId: f.ctx.currentUserId,
    createdAt: Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal',
  }
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
        withEventId({ t: 'user-started-space', spaceId, userId: currentUser.userId } as const),
      ),
    (model) =>
      EventSourced.appendEvent(
        Space.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userA.userId } as const),
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
    (model) => Space.toSpaceStarted(model),
    (space) => {
      if (!space) {
        throw new Error('Invalid fixture. Space is not started.')
      }
      return space
    },
  )

  const ctx: SpaceFrontendCtx = {
    ...f.ctx,
    currentScreen: {
      n: 'spaces',
      t: 'space-list',
    },
    currentUserId: currentUser.userId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {
      [currentUser.userId]: { ...(await Profile.random()), userId: currentUser.userId },
      [userA.userId]: userA,
      [userB.userId]: userB,
      [userC.userId]: userC,
    },
    space,
    currentUser,
  }

  const updates = (initial: Output, inputs: FixtureInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const output = SpacesFrontend.update({
        ...input,
        ctx: input.ctx ?? ctx,
        model: lastOutput.model,
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = (initial: Output, inputs: FixtureInput[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const view = (input: { model: SpacesTypes.ModelFrontend }) => {
    return f.render(<SpacesFrontend.View ctx={ctx} dispatch={() => {}} {...input} />)
  }

  const initial = SpacesFrontend.init({ ctx, stored: null })

  return {
    ...f,
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
    msgBackend: {
      t: 'got-msg-space',
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
    msgBackend: {
      t: 'got-msg-space',
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
    msgBackend: {
      t: 'got-msg-space',
      c: withEventMetaAt(happenedAt, {
        t: 'user-joined-space',
        spaceId,
        userId,
      }),
    },
  }
}
