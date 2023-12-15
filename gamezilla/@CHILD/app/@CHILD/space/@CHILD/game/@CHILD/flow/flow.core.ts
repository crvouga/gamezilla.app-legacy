import { Result } from "gamezilla/@SHARED/core";
import * as PuzzleBuilder from "./@CHILD/puzzle-builder/puzzle-builder.core";
import * as Play from "./@CHILD/play/play.core";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

//
//
// Model
//
//

export type ClientModel =
  | { t: "none" }
  | { t: "puzzle-builder"; c: PuzzleBuilder.ClientModel }
  | { t: "play"; c: Play.ClientModel };

export type ServerModel =
  | { t: "none" }
  | { t: "puzzle-builder"; c: PuzzleBuilder.ServerModel }
  | { t: "play"; c: Play.ClientModel };

//
//
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: "puzzle-builder"; c: PuzzleBuilder.ClientMsg }
  | { t: "play"; c: Play.ClientMsg };

export type ServerMsg =
  | { t: "puzzle-builder"; c: PuzzleBuilder.ServerMsg }
  | { t: "play"; c: Play.ServerMsg };

export type ToServer =
  | Req
  | { t: "puzzle-builder"; c: PuzzleBuilder.ToServer }
  | { t: "play"; c: Play.ToServer };

export type ToClient =
  | Res
  | { t: "puzzle-builder"; c: PuzzleBuilder.ToClient }
  | { t: "play"; c: Play.ToClient };

export type Req = {
  t: "input-mode";
  mode: ServerModel["t"];
};

export type Res = Req & {
  result: Result<string, ServerModel>;
};

export type Mode = "puzzle-builder" | "play";

export type GameEvent =
  | { t: "user-changed-mode"; mode: Mode }
  | { t: "play"; c: Play.GameEvent }
  | { t: "puzzle-builder"; c: PuzzleBuilder.GameEvent };

export type GameState =
  | { t: null }
  | { t: "puzzle-builder"; c: PuzzleBuilder.GameState }
  | { t: "play"; c: Play.GameState };

export const reducer = ({
  ctx,
  event,
  state,
}: {
  ctx: SpaceCtx;
  event: GameEvent;
  state: GameState;
}): GameState => {
  switch (event.t) {
    case "play": {
      switch (state.t) {
        case "play": {
          return {
            t: "play",
            c: Play.reducer({ ctx, event: event.c, state: state.c }),
          };
        }
        default: {
          return state;
        }
      }
    }

    case "puzzle-builder": {
      return state;
    }

    case "user-changed-mode": {
      return state;
    }
  }
};
