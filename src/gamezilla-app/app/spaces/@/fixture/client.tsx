import { NonEmpty, PhoneNumber, Posix, pipe, type TimeSpan } from 'gamezilla-app/@/core'
import { LamportClock, LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import type { Route } from 'gamezilla-app/@/routing/generated/routes'
import { routeChanged, type AppClientCtx } from 'gamezilla-app/app/@/client'
import { FixtureAppClient } from 'gamezilla-app/app/@/client/client-test-env'
import { Translator } from 'gamezilla-app/app/@/client/translator'
import { Profile, SpaceId, UserId } from 'gamezilla-app/app/@/data'
import { UserAccount } from 'gamezilla-app/app/@/data/account'
import { withEventId } from 'gamezilla-app/@/event-sourced/event'
import { GameName } from '../../games/@/game-name'
import { SpaceCore, type MsgCore } from '../../core'
import * as SpaceClient from '../../client'
import type * as SpacesTypes from '../../types'
import { SpaceClientCtx } from '../space-client-ctx'
import { EventSourced } from 'gamezilla-app/@/event-sourced'

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

export const SoaceClientFixture = async () => {
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
    const outputs: ReturnType<typeof SpaceClient.update>[] = []
    for (const msg of msgs) {
      switch (msg.t) {
        case 'msg': {
          const output = SpaceClient.update({
            ctx,
            model: initial,
            msg: msg.c
          })
          outputs.push(output)
          break
        }
        case 'msg-server': {
          const output = SpaceClient.update({
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

export const FixtureSpaceClient = async (input?: { currentRoute?: Route }) => {
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

  type Input = Partial<Parameters<typeof SpaceClient.update>[0]>

  type Output = ReturnType<typeof SpaceClient.update>

  const updates = (initial: Output, inputs: Input[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const output = SpaceClient.update({
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
    return f.render(<SpaceClient.View ctx={ctx} dispatch={() => {}} {...input} />)
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
  return SpaceClient.init({ ctx, stored: null })
}

//
//
//
//
//
//

export const serverConnected = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
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
    return SpaceClient.update({
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
  return SpaceClient.update({
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

    return SpaceClient.update({
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
          happenedAt: pipe(space._clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedJoinSpaceButton = (ctx: AppClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
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

    return SpaceClient.update({
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
          happenedAt: pipe(space._clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedLeaveSpaceButton = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-leave-space-button'
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
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: routeChanged(route)
  })
}

export const elapsed = (ctx: AppClientCtx, timeSpan: TimeSpan) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
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
    withEventId<MsgCore>({
      t: 'user-started-space',
      spaceId,
      userId: startedBy
    })
  ].reduce((model, msgEvt) => EventSourced.appendEvent(SpaceCore.config, model, msgEvt), SpaceCore.init)
}

export const serverListedSpaces =
  (ctx: AppClientCtx, spaceIds: SpaceId[] = [SpaceId.generate(), SpaceId.generate(), SpaceId.generate()]) =>
  (model: SpacesTypes.ModelClient) => {
    return SpaceClient.update({
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
  return SpaceClient.update({
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
    return SpaceClient.update({
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

export const userClickedEndSpaceButton = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-end-space-button'
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

    return SpaceClient.update({
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
          happenedAt: pipe(space._clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedGameTile = (ctx: AppClientCtx, gameName: GameName) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
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
    return SpaceClient.update({
      ctx,
      model,
      msgServer
    })
  }

export const gotSpace = (ctx: AppClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: {
      t: 'synced',
      space
    }
  })
}

export const gotCurrentUsersSpace = (ctx: AppClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
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
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-people-button'
    }
  })
}

export const clickedUser = (ctx: AppClientCtx, userId: UserId) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-user',
      userId
    }
  })
}

export const loggedOut = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: {
      t: 'auth/unauthenticated'
    }
  })
}

export const clickedGoHomeButton = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-go-home-button'
    }
  })
}

export const clickedCurrentSpaceBottomBar = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-current-space-bottom-bar'
    }
  })
}

export const clickedUserPreviewLink = (ctx: AppClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-preview-user-link'
    }
  })
}
