import {
  Space,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ServerCmd } from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff } from "gamezilla/@SHARED/core";
import * as GameServer from "../@CHILD/game/game.server";
import { ServerModel, ServerMsg, ToClient } from "../space.core";
import { spaceCmdToCmd } from "./update-shared";

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
