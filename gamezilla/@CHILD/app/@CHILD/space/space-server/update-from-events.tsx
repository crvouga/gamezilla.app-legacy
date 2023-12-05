import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  broadcast,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, batchMsgs, chainAwait } from "gamezilla/@SHARED/core";
import { withMeta$ } from "gamezilla/@SHARED/event-stream";
import * as GameServer from "../@CHILD/game/game.server";
import { SpaceServerCmd } from "../@SHARED/space-cmd";
import {
  Event,
  EventWithMeta,
  ServerModel,
  ServerMsg,
  ToClient,
  appendEvent,
  toStartedSpace,
} from "../space.core";
import { spaceCmdToCmd } from "./update-shared";

type Output = {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
}

export const updateFromEvents = async (input: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  events: EventWithMeta[];
}): Promise<Output> => {
  return updateFromEventsLoop(input.ctx, input.events, input);
};

async function updateFromEventsLoop(
  ctx: ServerCtx | ReqCtx,
  events: EventWithMeta[],
  acc: Output
): Promise<Output> {
  const [event, ...rest] = events;

  if (!event) {
    return acc;
  }

  if (event.eventId in acc.model.events.events) {
    return updateFromEventsLoop(ctx, rest, acc);
  }

  const updated = await chainAwait(
    acc,
    (model) => appendNewEvent({ model, event: event }),
    (model) => syncUserWhenJoined({ model, event: event }),
    (model) => sendEventToClients({ model, event: event })
  );

  const updatedGame = await updateGameFromEvent({
    ctx: ctx,
    model: updated.model,
    event,
  });

  const accNew: Output = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updated.cmd, updatedGame.cmd),
    eff: Eff.batch([acc.eff, updated.eff, updatedGame.eff]),
  };

  const eventsNew: EventWithMeta[] = batchMsgs(rest, updatedGame.events);

  return updateFromEventsLoop(ctx, eventsNew, accNew);
}

async function appendNewEvent({
  model,
  event,
}: {
  model: ServerModel;
  event: EventWithMeta;
}) {
  const appended: ServerModel = {
    ...model,
    ...appendEvent(model, event),
  };
  return { model: appended };
}

async function sendEventToClients({
  model,
  event,
}: {
  model: ServerModel;
  event: EventWithMeta;
}): Promise<Output> {
  const space = toStartedSpace(model, event.spaceId);
  const cmd =
    event.t === "game" && space
      ? sendToUser<ToClient>(Object.values(space.users), {t: 'event', c: event, causedBy: event, clock: model.clock})
      : broadcast<ToClient>({t: 'event', c: event, causedBy: event, clock: model.clock});
  return { model, cmd: [cmd] };
}

async function syncUserWhenJoined({
  model,
  event,
}: {
  model: ServerModel;
  event: EventWithMeta;
}): Promise<Output> {
  if (event.t === "user-joined-space") {
    const space = toStartedSpace(model, event.spaceId);

    if (!space) {
      return { model };
    }

    return {
      model,
      cmd: [
        sendToUser([event.userId], {
          t: "sync",
          events: model.events,
          causedBy: event,
          clock: model.clock,
        }),
      ],
    };
  }
  return { model };
}

async function updateGameFromEvent({
  model,
  ctx,
  event,
}: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  event: EventWithMeta;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: EventWithMeta[];
}> {
  const space = toStartedSpace(model, event.spaceId);

  if (!space || !space.game || event.t !== "game" || !ctx.currentUserId) {
    return { model };
  }

  const updated = await GameServer.update({
    ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
    model: model.games[event.spaceId],
    gameEvent: {...event,...event.c},
    state: space.game,
  });
  

  const eventsNew =
    updated.gameEvent?.map((e) =>
      withMeta$<Event>({
        t: "game",
        spaceId: event.spaceId,
        c: e,
      })
    ) ?? [];

  const modelNew: ServerModel = {
    ...model,
    games: {
      ...model.games,
      [event.spaceId]: updated.model,
    },
  };

  return {
    model: modelNew,
    cmd: spaceCmdToCmd(
      space,
      SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
        t: "game",
        spaceId: event.spaceId,
        causedBy: event,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game", c, spaceId: event.spaceId }),
      updated.eff
    ),
    events: eventsNew,
  };
}
