import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  playSound,
  pushRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, batchMsgs, chain } from "gamezilla/@SHARED/core";
import { withMeta } from "gamezilla/@SHARED/event-stream";
import * as GameClient from "../@CHILD/game/game.client";
import {
  ClientModel,
  ClientMsg,
  Event,
  EventWithMeta,
  ToServer,
  appendEvent,
  toStartedSpace,
  toStateUser,
} from "../space.core";

/**
 * Handles merging new events into the client model
 */
export function updateFromEvents(input: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  events: EventWithMeta[];
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} {
  return updateFromEventsLoop(input.ctx, {
    model: input.model,
    cmd: [],
    eff: Eff.None,
    events: input.events,
  });
}

export function updateFromEventsLoop(
  ctx: ClientCtx | AnonymousClientCtx,
  acc: {
    model: ClientModel;
    cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
    eff?: Eff<ClientMsg>;
    events?: EventWithMeta[];
  }
): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff?: Eff<ClientMsg>;
  events?: EventWithMeta[];
} {
  const [event, ...rest] = acc.events ?? [];

  if (!event || event.eventId in acc.model.events.events) {
    return acc;
  }

  const updated = chain(
    acc,
    (model) => appendEvents({ model, event }),
    (model) => sendEventToServer({ model, event }),
    (model) => updateSoundFromEvent({ model, ctx, event }),
    (model) => redirectWhenSpaceStarted({ model, ctx, event })
  );

  const updatedGame = updateGameFromEvent({ model: updated.model, ctx, event });

  const accNew: typeof acc = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updatedGame.cmd, updated.cmd),
    eff: Eff.batch([acc.eff, updatedGame.eff, updated.eff]),
    events: batchMsgs(rest, updatedGame.event),
  };

  return updateFromEventsLoop(ctx, accNew);
}

function sendEventToServer({
  model,
  event,
}: {
  model: ClientModel;
  event: EventWithMeta;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} {
  return {
    model,
    cmd: [
      sendToServer({
        ...event,
        profile: null,
      }),
    ],
  };
}

function appendEvents({
  model,
  event,
}: {
  model: ClientModel;
  event: EventWithMeta;
}): {
  model: ClientModel;
} {
  const appended = appendEvent(model, [event]);
  return { model: { ...model, ...appended } };
}

function redirectWhenSpaceStarted({
  model,
  ctx,
  event,
}: {
  model: ClientModel;
  event: EventWithMeta;
  ctx: ClientCtx | AnonymousClientCtx;
}) {
  if (
    event.t === "user-started-space" &&
    ctx.currentUserId &&
    toStateUser(model, ctx.currentUserId).spaceId === event.spaceId
  ) {
    return {
      model,
      cmd: [
        pushRoute({
          t: "space",
          c: { t: "space", spaceId: event.spaceId },
        }),
      ],
    };
  }

  return { model };
}

function updateGameFromEvent({
  model,
  event,
  ctx,
}: {
  model: ClientModel;
  event: EventWithMeta;
  ctx: ClientCtx | AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  event?: EventWithMeta[];
} {
  const space = toStartedSpace(model, event.spaceId);

  if (!space?.game || !ctx.currentUserId) {
    return { model };
  }

  const updatedGame = GameClient.update({
    ctx: {
      ...ctx,
      currentUserId: ctx.currentUserId,
      space: space,
    },
    gameEvent: event.t === "game" ? event.c : null,
    model: model.games[event.spaceId],
    state: space.game,
  });

  const eventsNew =
    updatedGame.gameEvent?.map((e) =>
      withMeta<Event>({
        t: "game",
        spaceId: event.spaceId,
        c: e,
      })
    ) ?? [];

  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [event.spaceId]: updatedGame.model,
      },
    },
    eff: Eff.map_(
      (c) => ({ t: "game-msg", spaceId: event.spaceId, c }),
      updatedGame.eff
    ),
    event: eventsNew,
    cmd: ClientCmd.map(
      updatedGame?.cmd ?? [],
      (c) => ({
        t: "game-msg",
        c,
        spaceId: space.spaceId,
      }),
      (c) => ({
        t: "game-msg",
        c,
        spaceId: space.spaceId,
      })
    ),
  };
}

const updateSoundFromEvent = ({
  ctx,
  model,
  event,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  model: ClientModel;
  event: Event;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  if (!ctx.currentUserId) {
    return { model };
  }

  const currentUserState = toStateUser(model, ctx.currentUserId);

  if (event.t === "user-joined-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (event.t === "user-left-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (event.t === "user-started-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (event.t === "user-ended-space" && event.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (
    event.t === "user-inputted-game" &&
    event.spaceId === currentUserState.spaceId
  ) {
    return {
      model,
      cmd: [
        playSound(
          event.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin
        ),
      ],
    };
  }

  return {
    model,
  };
};
