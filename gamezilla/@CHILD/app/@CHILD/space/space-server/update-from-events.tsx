import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
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

export const updateFromEvents = async (input: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  events: EventWithMeta[];
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
}> => {
  return updateFromEventsLoop(input.ctx, {
    model: input.model,
    events: input.events,
    cmd: [],
    eff: Eff.None,
  });
};

async function updateFromEventsLoop(
  ctx: ServerCtx | ReqCtx,
  acc: Awaited<ReturnType<typeof updateGameFromEvent>>
) {
  const [event, ...rest] = acc.events ?? [];

  if (!event) {
    return acc;
  }

  if (event.eventId in acc.model.events.events) {
    return updateFromEventsLoop(ctx, acc);
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

  const accNew: Awaited<ReturnType<typeof updateGameFromEvent>> = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updated.cmd, updatedGame.cmd),
    eff: Eff.batch([acc.eff, updated.eff, updatedGame.eff]),
    events: batchMsgs(rest, updatedGame.events),
  };

  return updateFromEventsLoop(ctx, accNew);
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
    ...appendEvent(model, [event]),
  };
  return { model: appended };
}

async function sendEventToClients({
  model,
  event,
}: {
  model: ServerModel;
  event: EventWithMeta;
}) {
  const space = toStartedSpace(model, event.spaceId);
  const cmd =
    event.t === "game" && space
      ? sendToUser(Object.values(space.users), event)
      : broadcast<ToClient>(event);
  return { model, cmd: [cmd] };
}

async function syncUserWhenJoined({
  model,
  event,
}: {
  model: ServerModel;
  event: EventWithMeta;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
}> {
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
    gameEvent: event.c,
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
        t: "game-msg",
        spaceId: event.spaceId,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game-msg", c, spaceId: event.spaceId }),
      updated.eff
    ),
    events: eventsNew,
  };
}
