import { GameCore } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-core";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { FlowGrid, FlowGridUIPlay } from "../../@SHARED/flow";
import { samples } from "../../@SHARED/flow/flow-grid/flow-grid-samples";

//
//
//
//
//
//

export type ClientModel = {
  gridPlay: FlowGridUIPlay.Model;
  grid: FlowGrid.Model;
};

export type ServerModel = {};

//
//
//
//
//
//

export type ClientMsg =
  | {
      t: "msgEvent";
      c: GameMsg;
    }
  | {
      t: "grid";
      c: FlowGridUIPlay.Msg;
    };

export type ServerMsg = { t: null };

export type ToServer = { t: null };

export type ToClient = { t: null };

export type GameMsg = {
  t: "grid";
  c: FlowGridUIPlay.Msg;
};

export type GameModel = {
  gridPlay: FlowGridUIPlay.Model;
  grid: FlowGrid.Model;
};

type Module = GameCore<{
  Ctx: SpaceCtx;
  GameModel: GameModel;
  GameMsg: GameMsg;
}>;

export const initGame: Module["initGame"] = () => {
  const grid = samples["8x8"][1];
  return {
    gridPlay: FlowGridUIPlay.init({ grid }),
    grid,
  };
};

export const reducer: Module["reducer"] = ({ modelGame, msgEvent }) => {
  switch (msgEvent.t) {
    case "grid": {
      const gridPlayNew = FlowGridUIPlay.update({
        msg: msgEvent.c,
        model: modelGame.gridPlay,
        grid: modelGame.grid,
      });
      return { gridPlay: gridPlayNew, grid: modelGame.grid };
    }
  }
};
