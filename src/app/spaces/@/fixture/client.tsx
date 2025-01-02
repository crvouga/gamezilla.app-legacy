import { NonEmpty } from '~/@/array/non-empty'
import { EventSourced } from '~/@/event-sourced'
import { withEventId, withEventMetaAt } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { PhoneNumber } from '~/@/phone-number'
import type { Route } from '~/@/routing/generated/routes'
import { Posix } from '~/@/time/posix'
import { AppClientCtx } from '~/app/@/client/ctx'
import { FixtureAppClient } from '~/app/@/client/fixture'
import { Translator } from '~/app/@/client/translator'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpacesClient } from '../../client'
import { SpaceCore } from '../../core/space-core'
import type * as SpacesTypes from '../../types'

export const SpaceClientFixture = async () => {
  const currentUserId = UserId.generate()
  const ctx: AppClientCtx = {
    navigatorLanguage: 'en',
    t: Translator('en'),
    currentRoute: {
      n: 'spaces',
      t: 'space-list'
    },
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {},
    currentUserId,
    currentUserRole: 'normal',
    currentUser: {
      createdAt: Posix.now(),
      phoneNumber: PhoneNumber.random(),
      role: 'normal',
      userId: currentUserId
    }
  }

  type Msg =
    | {
        t: 'msg'
        c: SpacesTypes.MsgClient
      }
    | {
        t: 'msg-server'
        c: SpacesTypes.MsgToClient
      }

  const updates = (initial: SpacesTypes.ModelClient, msgs: Msg[]) => {
    const outputs: ReturnType<typeof SpacesClient.update>[] = []
    for (const msg of msgs) {
      switch (msg.t) {
        case 'msg': {
          const output = SpacesClient.update({
            ctx,
            model: initial,
            msg: msg.c
          })
          outputs.push(output)
          break
        }
        case 'msg-server': {
          const output = SpacesClient.update({
            ctx,
            model: initial,
            msgServer: msg.c
          })
          outputs.push(output)
          break
        }
      }
    }
    return outputs
  }

  return {
    ctx,
    updates
  }
}

export type FixtureInput = Partial<Parameters<typeof SpacesClient.update>[0]>

export type Output = ReturnType<typeof SpacesClient.update>

export const FixtureSpacesClient = async (input?: { currentRoute?: Route }) => {
  const f = await FixtureAppClient(input)
  const currentUser: UserAccount = {
    userId: f.ctx.currentUserId,
    createdAt: Posix.now(),
    phoneNumber: PhoneNumber.random(),
    role: 'normal'
  }
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
        withEventId({ t: 'user-started-space', spaceId, userId: currentUser.userId } as const)
      ),
    (model) =>
      EventSourced.appendEvent(
        SpaceCore.config,
        model,
        withEventId({ t: 'user-joined-space', spaceId, userId: userA.userId } as const)
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
      ),
    (model) => SpaceCore.toSpaceStarted(model),
    (space) => {
      if (!space) {
        throw new Error('Invalid fixture. Space is not started.')
      }
      return space
    }
  )

  const ctx: SpaceClientCtx = {
    ...f.ctx,
    currentRoute: {
      n: 'spaces',
      t: 'space-list'
    },
    currentUserId: currentUser.userId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {
      [currentUser.userId]: { ...(await Profile.random()), userId: currentUser.userId },
      [userA.userId]: userA,
      [userB.userId]: userB,
      [userC.userId]: userC
    },
    space,
    currentUser
  }

  const updates = (initial: Output, inputs: FixtureInput[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const output = SpacesClient.update({
        ...input,
        ctx: input.ctx ?? ctx,
        model: lastOutput.model
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = (initial: Output, inputs: FixtureInput[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const view = (input: { model: SpacesTypes.ModelClient }) => {
    return f.render(<SpacesClient.View ctx={ctx} dispatch={() => {}} {...input} />)
  }

  const initial = SpacesClient.init({ ctx, stored: null })

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
    view
  }
}

export const userStartedSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msgServer: {
      t: 'got-msg-core',
      c: withEventMetaAt(happenedAt, {
        t: 'user-started-space',
        spaceId,
        userId
      })
    }
  }
}

export const userLeftSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msgServer: {
      t: 'got-msg-core',
      c: withEventMetaAt(happenedAt, {
        t: 'user-left-space',
        spaceId,
        userId
      })
    }
  }
}

export const userJoinedSpace = (happenedAt: number, userId: UserId, spaceId: SpaceId): FixtureInput => {
  return {
    msgServer: {
      t: 'got-msg-core',
      c: withEventMetaAt(happenedAt, {
        t: 'user-joined-space',
        spaceId,
        userId
      })
    }
  }
}
