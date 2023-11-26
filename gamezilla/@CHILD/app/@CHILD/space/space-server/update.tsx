import {
  Space,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  ServerCmd,
  ServerCtx,
  broadcast,
  sendToUser,
} from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, chainAwait } from "gamezilla/@SHARED/core";
import * as GameServer from "../@CHILD/game/game.server";
import {
  EventWithMeta,
  ServerModel,
  ServerMsg,
  ToClient,
  appendEvent,
  toStateSpace,
} from "../space.core";

/**
 * Handles updating the client model from updated game model
 */
export const mergeUpdatedGame = ({
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
  ctx: ServerCtx;
  model: ServerModel;
  events: EventWithMeta[];
}): Promise<{
  model: ServerModel;
  cmd?: ServerCmd<ToClient>[];
}> => {
  const eventsNew = input.events.filter(
    (event) => !(event.eventId in input.model.events.events)
  );

  return chainAwait(input, appendEvents, sendEventsToClients);

  function appendEvents(model: ServerModel) {
    const appended = appendEvent(model, eventsNew);
    return { model: { ...model, ...appended } };
  }

  function sendEventsToClients(model: ServerModel) {
    const cmd = eventsNew.flatMap((event) => {
      const space = toStateSpace(model, event.spaceId);
      if (space.type === "initial" || space.type === "ended") {
        return [];
      }
      if (event.t === "game") {
        return sendToUser(Object.values(space.users), event);
      }
      return broadcast(event);
    });

    return { model, cmd };
  }
};

const spaceCmdToCmd = (space: Space, cmd?: SpaceServerCmd<ToClient>[]) => {
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
};
