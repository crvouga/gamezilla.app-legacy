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
      t: "event";
      c: GameEvent;
    }
  | {
      t: "grid";
      c: FlowGridUIPlay.Msg;
    };

export type ServerMsg = { t: null };

export type ToServer = { t: null };

export type ToClient = { t: null };

export type GameEvent = {
  t: "grid";
  c: FlowGridUIPlay.Msg;
};

export type GameState = {
  gridPlay: FlowGridUIPlay.Model;
  grid: FlowGrid.Model;
};

type Module = GameCore<{
  Ctx: SpaceCtx;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const initState: Module["initState"] = () => {
  const grid = samples["8x8"][1];
  return {
    gridPlay: FlowGridUIPlay.init({ grid }),
    grid,
  };
};

export const reducer: Module["reducer"] = ({ state, event }) => {
  switch (event.t) {
    case "grid": {
      const gridPlayNew = FlowGridUIPlay.update({
        msg: event.c,
        model: state.gridPlay,
        grid: state.grid,
      });
      return { gridPlay: gridPlayNew, grid: state.grid };
    }
  }
};
