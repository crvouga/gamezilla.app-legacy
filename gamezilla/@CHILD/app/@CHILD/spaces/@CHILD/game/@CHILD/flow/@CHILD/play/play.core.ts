import { GameCore } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-core";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { FlowGridUIPlay } from "../../@SHARED/flow";
import { samples } from "../../@SHARED/flow/flow-grid/flow-grid-samples";

//
//
//
//
//
//

export type ClientModel = {
  grid: FlowGridUIPlay.Model;
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
  grid: FlowGridUIPlay.Model;
};

type Module = GameCore<{
  Ctx: SpaceCtx;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const initState: Module["initState"] = () => {
  return {
    grid: FlowGridUIPlay.init({
      grid: samples["8x8"][1],
    }),
  };
};

export const reducer: Module["reducer"] = ({ state, event }) => {
  switch (event.t) {
    case "grid": {
      const grid = FlowGridUIPlay.update({
        msg: event.c,
        model: state.grid,
      });
      return { grid };
    }
  }
};
