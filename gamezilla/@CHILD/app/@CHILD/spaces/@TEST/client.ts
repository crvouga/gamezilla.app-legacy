import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import {
  AppRoute,
  ClientCtx,
  routeChanged,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { Posix, TimeSpan, p } from "gamezilla/@SHARED/core"
import * as SpaceClient from "../spaces.client"
import * as SpaceCore from "../spaces.core"
import { Space, SpaceEvent } from "../spaces-core"
import { GameName } from "../@CHILD/game/game.core"

export const ctx: ClientCtx = {
  currentRoute: {
    t: "spaces",
    c: {
      t: "space-list",
    },
  },
  documentVisibilityState: "visible",
  now: Posix.now(),
  profiles: {},
  currentUserId: UserId.generate(),
}

export const init = (ctxOverride: ClientCtx = ctx) => {
  return SpaceClient.init({ ctx: ctxOverride, stored: null })
}

export const serverConnected = async (model: SpaceCore.ModelClient) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: {
      t: "wire/server-connected",
    },
  })
}

export const userStartedSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId,
) => {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-started-space",
        spaceId,
        userId,
      }),
    },
  })
}

export const clickedStartSpaceButton = (
  model: SpaceCore.ModelClient,
  spaceId: SpaceId,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "clicked-start-space-button",
      spaceId,
    },
  })
}

export const userJoinedSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId,
) => {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-joined-space",
        spaceId: spaceId,
        userId: userId,
      }),
    },
  })
}

export const userLeftSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-left-space",
        spaceId: spaceId,
        userId: userId,
      }),
    },
  })
}

export const clickedLeaveSpaceButton = (
  model: SpaceCore.ModelClient,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "clicked-leave-space-button",
    },
  })
}

export const changeRoute = async (
  model: SpaceCore.ModelClient,
  route: AppRoute,
) => {
  return SpaceClient.update({
    ctx,
    model,
    msgEvt: routeChanged(route),
  })
}

export const timePassed =
  (timeSpan: TimeSpan) => (model: SpaceCore.ModelClient) => {
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
  ].reduce((model, msgEvt) => Space.appendEvent({ model, msgEvt }), Space.init)
}

export const serverListedSpaces = async (
  model: SpaceCore.ModelClient,
  spaceIds: SpaceId[] = [
    SpaceId.generate(),
    SpaceId.generate(),
    SpaceId.generate(),
  ],
) => {
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

export const clickSpaceCard = async (
  model: SpaceCore.ModelClient,
  spaceId: SpaceId,
) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: { t: "clicked-space-card", spaceId },
  })
}

export const clickBackButton = async (
  model: SpaceCore.ModelClient,
  from: "join-screen",
) => {
  return SpaceClient.update({
    ctx,
    model,
    msg: { t: "clicked-back-button", from },
  })
}

export const userEndedSpace = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-ended-space",
        spaceId,
        userId,
      }),
    },
  })
}

export const userClickedEndSpaceButton = (
  model: SpaceCore.ModelClient,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "clicked-end-space-button",
    },
  })
}

export const userInputtedGame = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  spaceId: SpaceId,
  game: GameName | null,
) => {
  return SpaceClient.update({
    ctx,
    model: model,
    msg: {
      t: "event",
      c: withId({
        t: "user-inputted-game",
        game,
        spaceId,
        userId,
      }),
    },
  })
}

export const gotMsgServer = (
  model: SpaceCore.ModelClient,
  msgServer: SpaceCore.MsgToClient,
) => {
  return SpaceClient.update({ ctx, model, msgServer })
}

export const gotSpace = (model: SpaceCore.ModelClient, space: Space.Model) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: { t: "synced", space },
  })
}

export const gotCurrentUsersSpace = (
  model: SpaceCore.ModelClient,
  space: Space.Model,
) => {
  return SpaceClient.update({
    ctx,
    model,
    msgServer: { t: "current-user-space", space },
  })
}
export const makeSpace = (spaceId: SpaceId, hostId: UserId) => {
  return p(
    Space.init,
    //
    (model) =>
      Space.appendEvent({
        model,
        msgEvt: withId({
          t: "user-started-space",
          spaceId: spaceId,
          userId: hostId,
        }),
      }),
  )
}

export const clickedPeopleButton = (
  model: SpaceCore.ModelClient,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "clicked-people-button",
    },
  })
}

export const clickedUser = (
  model: SpaceCore.ModelClient,
  userId: UserId,
  ctxOverride: ClientCtx = ctx,
) => {
  return SpaceClient.update({
    ctx: ctxOverride,
    model: model,
    msg: {
      t: "clicked-user",
      userId,
    },
  })
}
