import {
  EventId,
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  broadcast,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, batchMsgs } from "gamezilla/@SHARED/core";
import * as GameServer from "../@CHILD/game/game.server";
import { SpaceServerCmd } from "../@SHARED/space-server-cmd";
import {
  Event,
  ServerModel,
  ServerMsg,
  SpaceEvents,
  ToClient,
  appendEvent,
  toStartedSpace,
} from "../space.core";
import { spaceCmdToCmd } from "./update-shared";

type Output = {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
};

export const updateFromSpaceEvents = async (input: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  events: WithEventId<Event>[];
}): Promise<Output> => {
  return loop(input.ctx, input.events, input);
};

async function loop(
  ctx: ServerCtx | ReqCtx,
  events: WithEventId<Event>[],
  acc: Output
): Promise<Output> {
  const [event, ...rest] = events;

  if (!event) {
    return acc;
  }

  if (event.eventId in acc.model.events._events) {
    return loop(ctx, rest, acc);
  }

  const updated = await AppServerModule.chainUpdates(
    acc,
    (model) => appendNewEvent({ model, event: event }),
    (model) => syncUserWhenJoined({ model, event: event }),
    (model) => sendEventToClients({ model, eventId: event.eventId })
  );

  const updatedGame = await updateGameFromEvent({
    ctx: ctx,
    model: updated.model,
    eventId: event.eventId,
  });

  const accNew: Output = {
    model: updatedGame.model,
    cmd: batchMsgs(acc.cmd, updated.cmd, updatedGame.cmd),
    eff: Eff.batch([acc.eff, updated.eff, updatedGame.eff]),
  };

  const eventsNew: WithEventId<Event>[] = batchMsgs(rest, updatedGame.events);

  return loop(ctx, eventsNew, accNew);
}

async function appendNewEvent({
  model,
  event,
}: {
  model: ServerModel;
  event: WithEventId<Event>;
}) {
  const appended: ServerModel = {
    ...model,
    ...(await appendEvent(model, event)),
  };
  return { model: appended };
}

async function sendEventToClients({
  model,
  eventId,
}: {
  model: ServerModel;
  eventId: EventId;
}): Promise<Output> {
  const event = await SpaceEvents.get(model.events, eventId);

  if (!event) {
    return { model };
  }

  const space = toStartedSpace(model.latestState, event.spaceId);

  const toClient: ToClient = {
    t: "event",
    c: event,
    causedBy: event,
    clock: model.clock,
  };

  const cmd =
    event.t === "game" && space
      ? sendToUser<ToClient>(Object.values(space.users), toClient)
      : broadcast<ToClient>(toClient);

  return { model, cmd: [cmd] };
}

async function syncUserWhenJoined({
  model,
  event,
}: {
  model: ServerModel;
  event: WithEventId<Event>;
}): Promise<Output> {
  if (event.t === "user-joined-space") {
    const space = toStartedSpace(model.latestState, event.spaceId);

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
  eventId,
}: {
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  eventId: EventId;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: WithEventId<Event>[];
}> {
  const eventWithMeta = model.events._events[eventId];

  if (!eventWithMeta) {
    return { model };
  }

  const space = toStartedSpace(model.latestState, eventWithMeta.spaceId);

  if (
    !space ||
    !space.game ||
    eventWithMeta.t !== "game" ||
    !ctx.currentUserId
  ) {
    return { model };
  }

  const updated = await GameServer.update({
    ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
    model: model.games[eventWithMeta.spaceId],
    gameEvent: { ...eventWithMeta, ...eventWithMeta.c },
    state: space.game,
  });

  const eventsNew =
    updated.gameEvent?.map((e) =>
      withId<Event>({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        c: e,
      })
    ) ?? [];

  const modelNew: ServerModel = {
    ...model,
    games: {
      ...model.games,
      [eventWithMeta.spaceId]: updated.model,
    },
  };

  return {
    model: modelNew,
    cmd: spaceCmdToCmd(
      space,
      SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
        t: "game",
        spaceId: eventWithMeta.spaceId,
        causedBy: eventWithMeta,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game", c, spaceId: eventWithMeta.spaceId }),
      updated.eff
    ),
    events: eventsNew,
  };
}
