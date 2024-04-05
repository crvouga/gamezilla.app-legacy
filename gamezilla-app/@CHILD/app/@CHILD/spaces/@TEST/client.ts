import { withId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import {
  ClientCtx,
  routeChanged,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { getTranslator } from "gamezilla-app/@CHILD/app/@SHARED/client/translator"
import {
  Profile,
  ProfileAvatar,
  SpaceId,
  UserId,
  Username,
} from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix, TimeSpan, pipe } from "gamezilla-app/@SHARED/core"
import {
  LamportClock,
  LamportTimestamp,
} from "gamezilla-app/@SHARED/lamport-clock"
import { Route } from "gamezilla-app/@SHARED/routing/generated/routes"
import { GameName } from "../@CHILD/game/game.core"
import { Space, SpaceEvent } from "../spaces-core"
import * as SpaceClient from "../spaces.client"
import * as SpaceCore from "../spaces.core"

//
//
//
//
//
//

export const Ctx = (): ClientCtx => {
  return {
    navigatorLanguage: "en",
    t: getTranslator("en"),
    currentRoute: { n: "spaces", t: "space-list" },
    documentVisibilityState: "visible",
    now: Posix.now(),
    profiles: {},
    currentUserId: UserId.generate(),
  }
}

const randomProfile = (): Profile => {
  return {
    avatarUrl: ProfileAvatar.random(),
    userId: UserId.generate(),
    username: Username.generate(),
  }
}

export const createFixture = () => {
  const currentUser = randomProfile()
  const userA = randomProfile()
  const userB = randomProfile()
  const userC = randomProfile()

  const ctx: ClientCtx = {
    navigatorLanguage: "en",
    t: getTranslator("en"),
    currentRoute: { n: "spaces", t: "space-list" },
    currentUserId: currentUser.userId,
    documentVisibilityState: "visible",
    now: Posix.now(),
    profiles: {
      [currentUser.userId]: currentUser,
      [userA.userId]: userA,
      [userB.userId]: userB,
      [userC.userId]: userC,
    },
  }
  return {
    ctx,
    initial: init(ctx),
    currentUser,
    userA,
    userB,
    userC,
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

export const serverConnected =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgEvt: {
        t: "wire/server-connected",
      },
    })
  }

//
//
//
//
//
//

export const userStartedSpace =
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) =>
  (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "event",
        c: {
          ...withId({
            t: "user-started-space",
            spaceId,
            userId,
          }),
          happenedAt: LamportTimestamp.fromNumber(0),
        },
      },
    })
  }

export const clickedStartSpaceButton =
  (ctx: ClientCtx, spaceId: SpaceId) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-start-space-button",
        spaceId,
      },
    })
  }

//
//
//
//
//
//

export const userJoinedSpace =
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) =>
  (model: SpaceCore.ModelClient) => {
    const space = model.spaces[spaceId]
    if (!space) {
      return { model }
    }

    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "event",
        c: {
          ...withId({
            t: "user-joined-space",
            spaceId: spaceId,
            userId: userId,
          }),
          happenedAt: pipe(
            space.clock,
            LamportClock.increment,
            LamportClock.toCurrentTime,
          ),
        },
      },
    })
  }

export const clickedJoinSpaceButton =
  (ctx: ClientCtx, spaceId: SpaceId) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-join-space-button",
        spaceId,
      },
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
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) =>
  (model: SpaceCore.ModelClient) => {
    const space = model.spaces[spaceId]

    if (!space) {
      return { model }
    }

    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "event",
        c: {
          ...withId({
            t: "user-left-space",
            spaceId: spaceId,
            userId: userId,
          }),
          happenedAt: pipe(
            space.clock,
            LamportClock.increment,
            LamportClock.toCurrentTime,
          ),
        },
      },
    })
  }

export const clickedLeaveSpaceButton =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-leave-space-button",
      },
    })
  }

//
//
//
//
//
//
//

export const changeRoute =
  (ctx: ClientCtx, route: Route) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgEvt: routeChanged(route),
    })
  }

export const elapsed =
  (ctx: ClientCtx, timeSpan: TimeSpan) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx: { ...ctx, now: Posix.add(ctx.now, timeSpan) },
      model,
      msg: { t: "time-passed" },
    })
  }

const toStartedSpace = (spaceId: SpaceId, startedBy: UserId) => {
  return [
    withId<SpaceEvent>({
      t: "user-started-space",
      spaceId,
      userId: startedBy,
    }),
  ].reduce(
    (model, msgEvt) => Space.appendEvent({ model, event: msgEvt }),
    Space.init,
  )
}

export const serverListedSpaces =
  (
    ctx: ClientCtx,
    spaceIds: SpaceId[] = [
      SpaceId.generate(),
      SpaceId.generate(),
      SpaceId.generate(),
    ],
  ) =>
  (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "listed-spaces",
        spaces: spaceIds.map((spaceId) =>
          toStartedSpace(spaceId, UserId.generate()),
        ),
        causedBy: "list-spaces",
      },
    })
  }

export const clickSpaceCard =
  (ctx: ClientCtx, spaceId: SpaceId) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: { t: "clicked-space-card", spaceId },
    })
  }

export const userEndedSpace =
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId) =>
  (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "event",
        c: {
          ...withId({
            t: "user-ended-space",
            spaceId,
            userId,
          }),
          happenedAt: LamportTimestamp.fromNumber(0),
        },
      },
    })
  }

export const userClickedEndSpaceButton =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-end-space-button",
      },
    })
  }

export const userInputtedGame =
  (ctx: ClientCtx, userId: UserId, spaceId: SpaceId, game: GameName | null) =>
  (model: SpaceCore.ModelClient) => {
    const space = model.spaces[spaceId]
    if (!space) {
      return { model }
    }

    return SpaceClient.update({
      ctx,
      model,
      msgServer: {
        t: "event",
        c: {
          ...withId({
            t: "user-inputted-game",
            game,
            spaceId,
            userId,
          }),
          happenedAt: pipe(
            space.clock,
            LamportClock.increment,
            LamportClock.toCurrentTime,
          ),
        },
      },
    })
  }

export const clickedGameTile =
  (ctx: ClientCtx, gameName: GameName) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: { t: "clicked-game-tile", gameName },
    })
  }

export const gotMsgServer =
  (ctx: ClientCtx, msgServer: SpaceCore.MsgToClient) =>
  (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({ ctx, model, msgServer })
  }

export const gotSpace =
  (ctx: ClientCtx, space: Space.Model) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: { t: "synced", space },
    })
  }

export const gotCurrentUsersSpace =
  (ctx: ClientCtx, space: Space.Model) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msgServer: { t: "current-user-space", space },
    })
  }

export const clickedPeopleButton =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-people-button",
      },
    })
  }

export const clickedUser =
  (ctx: ClientCtx, userId: UserId) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-user",
        userId,
      },
    })
  }

export const loggedOut = (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: {
      t: "auth/unauthenticated",
    },
  })
}

export const clickedGoHomeButton =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-go-home-button",
      },
    })
  }

export const clickedCurrentSpaceBottomBar =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-current-space-bottom-bar",
      },
    })
  }

export const clickedUserPreviewLink =
  (ctx: ClientCtx) => (model: SpaceCore.ModelClient) => {
    return SpaceClient.update({
      ctx,
      model,
      msg: {
        t: "clicked-preview-user-link",
      },
    })
  }
