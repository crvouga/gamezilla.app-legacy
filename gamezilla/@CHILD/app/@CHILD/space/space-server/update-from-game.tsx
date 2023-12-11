import * as GameServer from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/game.server";
import { Space } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space-cmd";
import {
  ServerModel,
  ServerMsg,
  ToClient,
} from "gamezilla/@CHILD/app/@CHILD/space/space.core";
import { ServerCmd } from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff } from "gamezilla/@SHARED/core";
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
        t: "game",
        spaceId: space.spaceId,
        causedBy: null,
        c,
      }))
    ),
    eff: Eff.map_(
      (c) => ({ t: "game", c, spaceId: space.spaceId }),
      updated.eff
    ),
  };
};
