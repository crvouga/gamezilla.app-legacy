import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Eff } from "gamezilla/@SHARED/core";
import { Game } from "../@CHILD/game/game.client";
import { ClientModel, ClientMsg, ToServer } from "../space.core";

/**
 * Handles updating the client model from updated game model
 */
export const updateFromGame = ({
  model,
  spaceId,
  updated,
}: {
  spaceId: SpaceId;
  model: ClientModel;
  updated: ReturnType<typeof Game.update>;
}): {
  model: ClientModel;
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  eff: Eff<ClientMsg>;
} => {
  return {
    model: {
      ...model,
      games: {
        ...model.games,
        [spaceId]: updated.model,
      },
    },
    cmd: ClientCmd.map(
      updated.cmd ?? [],
      (c) => ({ t: "game", c, spaceId }),
      (c) => ({ t: "game", c, spaceId })
    ),
    eff: Eff.map_((c) => ({ t: "game", c, spaceId }), updated.eff),
  };
};
