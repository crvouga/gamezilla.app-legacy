import { NonEmpty, Posix, pipe, type TimeSpan } from 'gamezilla-app/@/core'
import { LamportClock, LamportTimestamp } from 'gamezilla-app/@/lamport-clock'
import type { Route } from 'gamezilla-app/@/routing/generated/routes'
import { ClientCmd, ClientEvt, routeChanged, type ClientCtx } from 'gamezilla-app/app/@/client'
import { FixtureAppClient } from 'gamezilla-app/app/@/client/client-test-env'
import { Translator } from 'gamezilla-app/app/@/client/translator'
import { ProfileAvatar, SpaceId, UserId, Username, type Profile } from 'gamezilla-app/app/@/data'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { SpaceCore, type SpaceCoreEvent } from '../../spaces-core'
import * as SpaceClient from '../../spaces.client'
import type * as SpacesTypes from '../../spaces.types'
import type { SpaceClientCtx } from '../space'
import { GameName } from '../../game/@/game-name'

//
//
//
//
//
//

export const Ctx = (): ClientCtx => {
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
    currentUserId: UserId.generate(),
    currentUserRole: 'normal'
  }
}

export const SoaceClientFixture = async () => {
  const ctx: ClientCtx = {
    navigatorLanguage: 'en',
    t: Translator('en'),
    currentRoute: {
      n: 'spaces',
      t: 'space-list'
    },
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {},
    currentUserId: UserId.generate(),
    currentUserRole: 'normal'
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

const randomProfile = (): Profile => {
  const userId = UserId.generate()
  return {
    avatarUrl: ProfileAvatar.random(),
    userId,
    username: Username.fromString(`username-${userId}`)
  }
}

export const FixtureSpaceClient = async (input?: { currentRoute?: Route }) => {
  const f = await FixtureAppClient(input)
  const currentUser = {
    ...randomProfile(),
    userId: f.ctx.currentUserId
  }
  const userA = randomProfile()
  const userB = randomProfile()
  const userC = randomProfile()

  const spaceId = SpaceId.generate()

  const space = pipe(
    SpaceCore.init,
    (model) =>
      SpaceCore.appendEvent({
        model,
        event: withId({
          t: 'user-started-space',
          spaceId,
          userId: currentUser.userId
        })
      }),
    (model) =>
      SpaceCore.appendEvent({
        model,
        event: withId({
          t: 'user-joined-space',
          spaceId,
          userId: userA.userId
        })
      }),
    (model) =>
      SpaceCore.appendEvent({
        model,
        event: withId({
          t: 'user-joined-space',
          spaceId,
          userId: userB.userId
        })
      }),
    (model) =>
      SpaceCore.appendEvent({
        model,
        event: withId({
          t: 'user-joined-space',
          spaceId,
          userId: userC.userId
        })
      }),
    (model) => SpaceCore.toSpaceStarted(model),
    (space) => {
      if (!space) {
        throw new Error('Invalid fixture. Space is not started.')
      }
      return space
    }
  )

  const ctx: SpaceClientCtx = {
    navigatorLanguage: 'en',
    t: Translator('en'),
    currentRoute: {
      n: 'spaces',
      t: 'space-list'
    },
    currentUserId: currentUser.userId,
    currentUserRole: 'normal',
    documentVisibilityState: 'visible',
    now: Posix.now(),
    profiles: {
      [currentUser.userId]: currentUser,
      [userA.userId]: userA,
      [userB.userId]: userB,
      [userC.userId]: userC
    },
    space
  }

  type Input = {
    ctx?: ClientCtx | null
    msg?: SpacesTypes.MsgClient | null
    msgCmd?: ClientCmd<{
      MsgClient: SpacesTypes.MsgClient
      MsgToServer: SpacesTypes.MsgToServer
    }> | null
    msgServer?: SpacesTypes.MsgToClient | null
    msgEvt?: ClientEvt | null
  }

  type Output = ReturnType<typeof SpaceClient.update>

  const updates = (initial: Output, inputs: Input[]): NonEmpty<Output> => {
    const outputs: NonEmpty<Output> = [initial]
    for (const input of inputs) {
      const lastOutput = NonEmpty.last(outputs)
      const output = SpaceClient.update({
        ctx: input.ctx ?? ctx,
        model: lastOutput.model,
        msg: input.msg,
        msgServer: input.msgServer
      })
      outputs.push(output)
    }
    return outputs
  }

  const update = (initial: Output, inputs: Input[]): Output => {
    return NonEmpty.last(updates(initial, inputs))
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
    update
  }
}

export const init = (ctx: ClientCtx) => {
  return SpaceClient.init({ ctx, stored: null })
}

//
//
//
//
//
//

export const serverConnected = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
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
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: 'event',
        c: {
          ...withId({
            t: 'user-started-space',
            spaceId,
            userId
          }),
          happenedAt: LamportTimestamp.fromNumber(0)
        }
      }
    })
  }

export const clickedStartSpaceButton = (ctx: ClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
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
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
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
        t: 'event',
        c: {
          ...withId({
            t: 'user-joined-space',
            spaceId: spaceId,
            userId: userId
          }),
          happenedAt: pipe(space.clock, LamportClock.increment, LamportClock.toCurrentTime)
        }
      }
    })
  }

export const clickedJoinSpaceButton = (ctx: ClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
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

export const userLeftSpace = (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
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
      t: 'event',
      c: {
        ...withId({
          t: 'user-left-space',
          spaceId: spaceId,
          userId: userId
        }),
        happenedAt: pipe(space.clock, LamportClock.increment, LamportClock.toCurrentTime)
      }
    }
  })
}

export const clickedLeaveSpaceButton = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
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

export const changeRoute = (ctx: ClientCtx, route: Route) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: routeChanged(route)
  })
}

export const elapsed = (ctx: ClientCtx, timeSpan: TimeSpan) => (model: SpacesTypes.ModelClient) => {
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
    withId<SpaceCoreEvent>({
      t: 'user-started-space',
      spaceId,
      userId: startedBy
    })
  ].reduce(
    (model, msgEvt) =>
      SpaceCore.appendEvent({
        model,
        event: msgEvt
      }),
    SpaceCore.init
  )
}

export const serverListedSpaces =
  (ctx: ClientCtx, spaceIds: SpaceId[] = [SpaceId.generate(), SpaceId.generate(), SpaceId.generate()]) =>
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

export const clickSpaceCard = (ctx: ClientCtx, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
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
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) => (model: SpacesTypes.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: 'event',
        c: {
          ...withId({
            t: 'user-ended-space',
            spaceId,
            userId
          }),
          happenedAt: LamportTimestamp.fromNumber(0)
        }
      }
    })
  }

export const userClickedEndSpaceButton = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-end-space-button'
    }
  })
}

export const userInputtedGame =
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId, game: GameName | null) => (model: SpacesTypes.ModelClient) => {
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
        t: 'event',
        c: {
          ...withId({
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

export const clickedGameTile = (ctx: ClientCtx, gameName: GameName) => (model: SpacesTypes.ModelClient) => {
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
  (ctx: ClientCtx, msgServer: SpacesTypes.MsgToClient) => (model: SpacesTypes.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer
    })
  }

export const gotSpace = (ctx: ClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: {
      t: 'synced',
      space
    }
  })
}

export const gotCurrentUsersSpace = (ctx: ClientCtx, space: SpaceCore.Model) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: {
      t: 'current-user-space',
      space
    }
  })
}

export const clickedPeopleButton = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-people-button'
    }
  })
}

export const clickedUser = (ctx: ClientCtx, userId: UserId) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-user',
      userId
    }
  })
}

export const loggedOut = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: {
      t: 'auth/unauthenticated'
    }
  })
}

export const clickedGoHomeButton = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-go-home-button'
    }
  })
}

export const clickedCurrentSpaceBottomBar = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-current-space-bottom-bar'
    }
  })
}

export const clickedUserPreviewLink = (ctx: ClientCtx) => (model: SpacesTypes.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: {
      t: 'clicked-preview-user-link'
    }
  })
}
