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

export type MsgClient =
  | {
      t: "msgGame";
      c: MsgGame;
    }
  | {
      t: "grid";
      c: FlowGridUIPlay.Msg;
    };

export type MsgServer = { t: null };

export type MsgToServer = { t: null };

export type MsgToClient = { t: null };

export type MsgGame = {
  t: "grid";
  c: FlowGridUIPlay.Msg;
};

export type ModelGame = {
  gridPlay: FlowGridUIPlay.Model;
  grid: FlowGrid.Model;
};

type Module = GameCore<{
  Ctx: SpaceCtx;
  ModelGame: ModelGame;
  MsgGame: MsgGame;
}>;

export const initGame: Module["initGame"] = () => {
  const grid = samples["8x8"][1];
  return {
    gridPlay: FlowGridUIPlay.init({ grid }),
    grid,
  };
};

export const reducer: Module["reducer"] = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "grid": {
      const gridPlayNew = FlowGridUIPlay.update({
        msg: msgGame.c,
        model: modelGame.gridPlay,
        grid: modelGame.grid,
      });
      return { gridPlay: gridPlayNew, grid: modelGame.grid };
    }
  }
};
