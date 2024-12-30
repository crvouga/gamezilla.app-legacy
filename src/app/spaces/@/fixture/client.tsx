import { NonEmpty } from '~/@/array/non-empty'
import { EventSourced } from '~/@/event-sourced'
import { withEventId } from '~/@/event-sourced/event'
import { pipe } from '~/@/function/pipe'
import { LamportClock, LamportTimestamp } from '~/@/lamport-clock'
import { PhoneNumber } from '~/@/phone-number'
import type { Route } from '~/@/routing/generated/routes'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppClientCtx } from '~/app/@/client/client-ctx'
import { routeChanged } from '~/app/@/client/client-event'
import { FixtureAppClient } from '~/app/@/client/client-test-env'
import { Translator } from '~/app/@/client/translator'
import { UserAccount } from '~/app/@/data/account'
import { Profile } from '~/app/@/data/profile'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { SpacesClient } from '../../client'
import { SpaceCore } from '../../core/space-core'
import { type SpaceEvent } from '../../core/space-event'
import { GameName } from '../../games/@/game-name'
import type * as SpacesTypes from '../../types'
import { SpaceClientCtx } from '../space-client-ctx'

//
//
//
//
//
//

export const Ctx = (): AppClientCtx => {
  const currentUserId = UserId.generate()
  return {
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
}

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

  type Input = Partial<Parameters<typeof SpacesClient.update>[0]>

  type Output = ReturnType<typeof SpacesClient.update>

  const updates = (initial: Output, inputs: Input[]): NonEmpty<Output> => {
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

  const update = (initial: Output, inputs: Input[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
  }

  const view = (input: { model: SpacesTypes.ModelClient }) => {
    return f.render(<SpacesClient.View ctx={ctx} dispatch={() => {}} {...input} />)
  }

  return {
    ...f,
    ctx,
    initial: init(ctx),
    currentUser,
    userA,
    userB,
    userC,
    updates,
    update,
    view
  }
}

export const init = (ctx: AppClientCtx) => {
  return SpacesClient.init({ ctx, stored: null })
}

//
//
//
//
//
//

export const serverConnected = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgEvt: {
      t: 'wire/server-connected'
    }
  })
}

//
//
//
//
//
//

export const userStartedSpace =
  (ctx: AppClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'got-msg-core',
        c: {
          ...withEventId({
            t: 'user-started-space',
            spaceId,
            userId
          }),
          happenedAt: LamportTimestamp.fromNumber(0)
        }
      }
    })
  }

export const clickedStartSpaceButton = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-start-space-button',
      spaceId
    }
  })
}

//
//
//
//
//
//

export const userJoinedSpace =
  (ctx: AppClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    const space = model.spaces[spaceId]
    if (!space) {
      return {
        model
      }
    }

    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'got-msg-core',
        c: {
          ...withEventId({
            t: 'user-joined-space',
            spaceId: spaceId,
            userId: userId
          }),
          happenedAt: pipe(space.clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedJoinSpaceButton = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-join-space-button',
      spaceId
    }
  })
}

//
//
//
//
//
//
//

export const userLeftSpace =
  (ctx: AppClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    const space = model.spaces[spaceId]

    if (!space) {
      return {
        model
      }
    }

    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'got-msg-core',
        c: {
          ...withEventId({
            t: 'user-left-space',
            spaceId: spaceId,
            userId: userId
          }),
          happenedAt: pipe(space.clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedLeaveSpaceButton = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-leave-space-button',
      spaceId
    }
  })
}

//
//
//
//
//
//
//

export const changeRoute = (ctx: AppClientCtx, route: Route) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgEvt: routeChanged(route)
  })
}

export const elapsed = (ctx: AppClientCtx, timeSpan: TimeSpan) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx: {
      ...ctx,
      now: Posix.future(ctx.now, timeSpan)
    },
    model,
    msg: {
      t: 'time-passed'
    }
  })
}

const toStartedSpace = (spaceId: SpaceId, startedBy: UserId) => {
  return [
    withEventId<SpaceEvent>({
      t: 'user-started-space',
      spaceId,
      userId: startedBy
    })
  ].reduce((model, msgEvt) => EventSourced.appendEvent(SpaceCore.config, model, msgEvt), SpaceCore.init)
}

export const serverListedSpaces =
  (ctx: AppClientCtx, spaceIds: SpaceId[] = [SpaceId.generate(), SpaceId.generate(), SpaceId.generate()]) =>
  (model: SpacesTypes.ModelClient) => {
    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'listed-spaces',
        spaces: spaceIds.map((spaceId) => toStartedSpace(spaceId, UserId.generate())),
        causedBy: null
      }
    })
  }

export const clickSpaceCard = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-space-card',
      spaceId
    }
  })
}

export const userEndedSpace =
  (ctx: AppClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'got-msg-core',
        c: {
          ...withEventId({
            t: 'user-ended-space',
            spaceId,
            userId
          }),
          happenedAt: LamportTimestamp.fromNumber(0)
        }
      }
    })
  }

export const userClickedEndSpaceButton = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-end-space-button',
      spaceId
    }
  })
}

export const userInputtedGame =
  (ctx: AppClientCtx, userId: UserId, spaceId: SpaceId, game: GameName | null) => (model: SpacesTypes.ModelClient) => {
    const space = model.spaces[spaceId]
    if (!space) {
      return {
        model
      }
    }

    return SpacesClient.update({
      ctx,
      model,
      msgServer: {
        t: 'got-msg-core',
        c: {
          ...withEventId({
            t: 'user-inputted-game',
            game,
            spaceId,
            userId
          }),
          happenedAt: pipe(space.clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedGameTile = (ctx: AppClientCtx, gameName: GameName) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-game-tile',
      gameName
    }
  })
}

export const gotMsgServer =
  (ctx: AppClientCtx, msgServer: SpacesTypes.MsgToClient) => (model: SpacesTypes.ModelClient) => {
    return SpacesClient.update({
      ctx,
      model,
      msgServer
    })
  }

export const gotSpace = (ctx: AppClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgServer: {
      t: 'synced',
      space
    }
  })
}

export const gotCurrentUsersSpace = (ctx: AppClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgServer: {
      t: 'current-user-space',
      space,
      currentUser: ctx.currentUser
    }
  })
}

export const clickedPeopleButton = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-people-button'
    }
  })
}

export const clickedUser = (ctx: AppClientCtx, userId: UserId) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-user',
      userId
    }
  })
}

export const loggedOut = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msgEvt: {
      t: 'auth/unauthenticated'
    }
  })
}

export const clickedGoHomeButton = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-go-home-button'
    }
  })
}

export const clickedCurrentSpaceBottomBar = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpacesClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-current-space-bottom-bar'
    }
  })
}
