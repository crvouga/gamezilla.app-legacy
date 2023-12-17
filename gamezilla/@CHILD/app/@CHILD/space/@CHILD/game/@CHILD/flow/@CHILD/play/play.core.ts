import { GameCore } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-core";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { FlowGridUIPlay } from "../../@SHARED/flow";

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

export type ClientMsg = {
  t: "grid-play";
  c: FlowGridUIPlay.Msg;
};

export type ServerMsg = { t: null };

export type ToServer = { t: null };

export type ToClient = { t: null };

export type GameEvent = {
  t: null;
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
    grid: FlowGridUIPlay.init(),
  };
};

export const reducer: Module["reducer"] = ({ state }) => {
  return state;
};
