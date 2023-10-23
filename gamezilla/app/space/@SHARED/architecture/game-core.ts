import { SpaceCtx } from "../space";

export type GameCore<GameState, GameEvent> = {
  initState: (input: { ctx: SpaceCtx }) => GameState;
  reducer: (input: {
    ctx: SpaceCtx;
    msg: GameEvent;
    state: GameState;
  }) => GameState;
};
