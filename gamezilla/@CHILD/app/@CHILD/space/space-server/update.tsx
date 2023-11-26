import {
  Space,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  ServerCmd,
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

/**
 * Handles updating the client model from updated game model
 */
export const updateFromGame = ({
  model,
  space,
  updated,
}: {
  space: Space;
  model: ServerModel;
  updated: Awaited<ReturnType<typeof GameServer.update>>;
}): {
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [space.spaceId]: updated.model,
      },
    },
    cmd: spaceCmdToCmd(
      space,
      SpaceServerCmd.map(updated.cmd ?? [], (c) => ({
        t: "game-msg",
        spaceId: space.spaceId,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game-msg", c, spaceId: space.spaceId }),
      updated.eff
    ),
  };
};

export const updateFromEvents = async (input: {
  ctx: SpaceServerCtx;
  model: ServerModel;
  events: EventWithMeta[];
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
}> => {
  return updateGamesLoop(input.ctx, input);
};

async function updateGamesLoop(
  ctx: SpaceServerCtx,
  acc: Awaited<ReturnType<typeof updateOneGame>>
) {
  const [event, ...rest] = acc.events ?? [];

  if (!event) {
    return acc;
  }

  if (event.eventId in acc.model.events.events) {
    return acc;
  }

  const appended: ServerModel = {
    ...acc.model,
    ...appendEvent(acc.model, [event]),
  };

  const space = toStartedSpace(appended, event.spaceId);

  const updatedGame = await updateOneGame({
    ctx: ctx,
    space,
    model: appended,
    event,
  });

  const cmd =
    event.t === "game" && space
      ? sendToUser(Object.values(space.users), event)
      : broadcast<ToClient>(event);

  const accNew: Awaited<ReturnType<typeof updateOneGame>> = {
    model: updatedGame.model,
    cmd: [...(acc.cmd ?? []), ...(updatedGame.cmd ?? []), cmd],
    eff: Eff.batch([acc.eff, updatedGame.eff]),
    events: [...(rest ?? []), ...(updatedGame.events ?? [])],
  };

  return updateGamesLoop(ctx, accNew);
}

function spaceCmdToCmd(space: Space, cmd?: SpaceServerCmd<ToClient>[]) {
  return cmd?.map((cmd): ServerCmd<ToClient> => {
    switch (cmd.t) {
      case "send-to-space": {
        const userIds = Object.values(space.users);
        return sendToUser(userIds, cmd.msg);
      }
      default: {
        return cmd;
      }
    }
  });
}

async function updateOneGame({
  model,
  ctx,
  event,
  space,
}: {
  space: StateStarted | null;
  ctx: SpaceServerCtx;
  model: ServerModel;
  event: EventWithMeta;
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
  events?: EventWithMeta[];
}> {
  if (!space || !space.game || event.t !== "game") {
    return { model };
  }

  const updated = await GameServer.update({
    ctx,
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
