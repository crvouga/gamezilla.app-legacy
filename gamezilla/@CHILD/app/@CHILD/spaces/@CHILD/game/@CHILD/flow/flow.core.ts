import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { WithEventMeta } from "../../../../@SHARED/event";
import * as Play from "./@CHILD/play/play.core";
import * as Builder from "./@CHILD/builder/builder.core";
import { FlowPuzzle } from "./@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "./@SHARED/flow-puzzle/flow-puzzle-id";

//
//
// Model
//
//

export type BaseClientModel = {
  puzzles: {
    [flowPuzzleId: FlowPuzzleId]: FlowPuzzle;
  };
};

export type VariantClientModel =
  | { t: "none" }
  | { t: "builder"; c: Builder.ClientModel }
  | { t: "play"; c: Play.ClientModel };

export type ClientModel = BaseClientModel & VariantClientModel;

export type ServerModel =
  | { t: "none" }
  | { t: "builder"; c: Builder.ServerModel }
  | { t: "play"; c: Play.ServerModel };

//
//
// Msg
//
//

export type ClientMsg =
  | { t: "msgEvent"; c: GameMsg }
  | { t: "builder"; c: Builder.ClientMsg }
  | { t: "play"; c: Play.ClientMsg };

export type ServerMsg =
  | { t: "builder"; c: Builder.ServerMsg }
  | { t: "play"; c: Play.ServerMsg };

export type ToServer =
  | { t: "builder"; c: Builder.ToServer }
  | { t: "play"; c: Play.ToServer };

export type ToClient =
  | { t: "builder"; c: Builder.ToClient }
  | { t: "play"; c: Play.ToClient };

export type Mode = "builder" | "play";

export type GameMsg =
  | { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
  | { t: "play"; c: Play.GameMsg }
  | { t: "builder"; c: Builder.GameMsg };

export type GameModel =
  | { t: null }
  | { t: "builder"; c: Builder.GameModel }
  | { t: "play"; c: Play.GameModel };

export const initGame = () => {
  return { t: null };
};

export const reducer = ({
  ctx,
  msgEvent,
  modelGame,
}: {
  ctx: SpaceCtx;
  msgEvent: WithEventMeta<GameMsg>;
  modelGame: GameModel;
}): GameModel => {
  switch (msgEvent.t) {
    case "play": {
      switch (modelGame.t) {
        case "play": {
          return {
            t: "play",
            c: Play.reducer({
              ctx,
              msgEvent: msgEvent.c,
              modelGame: modelGame.c,
            }),
          };
        }
        default: {
          return modelGame;
        }
      }
    }

    case "builder": {
      switch (modelGame.t) {
        case "builder": {
          return {
            t: "builder",
            c: Builder.reducer({
              ctx,
              msgEvent: msgEvent.c,
              modelGame: modelGame.c,
            }),
          };
        }
        default: {
          return modelGame;
        }
      }
    }

    case "user-changed-mode": {
      if (msgEvent.userId !== ctx.space.hostId) {
        return modelGame;
      }

      switch (msgEvent.mode) {
        case null: {
          return { t: null };
        }

        case "play": {
          return {
            t: "play",
            c: Play.initGame({ ctx }),
          };
        }

        case "builder": {
          return {
            t: "builder",
            c: Builder.initGame({ ctx }),
          };
        }
      }
    }
  }
};
