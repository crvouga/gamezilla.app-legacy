import { GameCore } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-core";
import { FlowGridSamples, FlowGridUIPlay } from "../../@SHARED/flow";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

//
//
//
//
//
//

export type CoreModel = {
  grid: FlowGridUIPlay.Model;
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

export const initShared: CoreModel = {
  grid: FlowGridUIPlay.init(FlowGridSamples.samples["8x8"][0]),
};

//
//
//
//
//
//

export type ClientMsg = {
  t: "grid";
  c: FlowGridUIPlay.Msg;
};

export type ServerMsg = { t: null };

export type ToServer = {
  t: "new-sync";
  model: CoreModel;
};

export type ToClient = { t: null };

export type GameEvent = {
  t: "grid";
  c: FlowGridUIPlay.GameEvent;
};

export type GameState = {
  play: FlowGridUIPlay.GameState;
};

type Module = GameCore<{
  Ctx: SpaceCtx;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

export const initState: Module["initState"] = (input) => {
  return {
    play: FlowGridUIPlay.initState(input),
  };
};

export const reducer: Module["reducer"] = ({ event, state }) => {
  switch (event.t) {
    case "grid": {
      return state;
    }
  }
};
