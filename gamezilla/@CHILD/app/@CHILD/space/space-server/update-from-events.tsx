import {
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  broadcast,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff } from "gamezilla/@SHARED/core";
import { withMeta } from "gamezilla/@SHARED/event-stream";
import * as GameServer from "../@CHILD/game/game.server";
import {
  Event,
  EventWithMeta,
  ServerModel,
  ServerMsg,
  StateStarted,
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

  if (!event || event.eventId in acc.model.events.events) {
    return acc;
  }

  const appended: ServerModel = {
    ...acc.model,
    ...appendEvent(acc.model, [event]),
  };

  const space = toStartedSpace(appended, event.spaceId);

  const updatedGame = await updateGameFromEvent({
    ctx: ctx,
    space,
    model: appended,
    event,
  });

  const cmd =
    event.t === "game" && space
      ? sendToUser(Object.values(space.users), event)
      : broadcast<ToClient>(event);

  const accNew: Awaited<ReturnType<typeof updateGameFromEvent>> = {
    model: updatedGame.model,
    cmd: [...(acc.cmd ?? []), ...(updatedGame.cmd ?? []), cmd],
    eff: Eff.batch([acc.eff, updatedGame.eff]),
    events: [...(rest ?? []), ...(updatedGame.events ?? [])],
  };

  return updateFromEventsLoop(ctx, accNew);
}

async function updateGameFromEvent({
  model,
  ctx,
  event,
  space,
}: {
  space: StateStarted | null;
  ctx: ServerCtx | ReqCtx;
  model: ServerModel;
  event: EventWithMeta;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: EventWithMeta[];
}> {
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
      withMeta<Event>({
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
