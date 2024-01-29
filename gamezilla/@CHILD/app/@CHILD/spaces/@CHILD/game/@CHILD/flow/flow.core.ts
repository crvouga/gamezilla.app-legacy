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
  | { t: "msgEvt"; c: MsgGame }
  | { t: "builder"; c: Builder.ClientMsg }
  | { t: "play"; c: Play.ClientMsg };

export type ServerMsg =
  | { t: "builder"; c: Builder.ServerMsg }
  | { t: "play"; c: Play.ServerMsg };

export type MsgToServer =
  | { t: "builder"; c: Builder.MsgToServer }
  | { t: "play"; c: Play.MsgToServer };

export type MsgToClient =
  | { t: "builder"; c: Builder.MsgToClient }
  | { t: "play"; c: Play.MsgToClient };

export type Mode = "builder" | "play";

export type MsgGame =
  | { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
  | { t: "play"; c: Play.MsgGame }
  | { t: "builder"; c: Builder.MsgGame };

export type ModelGame =
  | { t: null }
  | { t: "builder"; c: Builder.ModelGame }
  | { t: "play"; c: Play.ModelGame };

export const initGame = () => {
  return { t: null };
};

export const reducer = ({
  ctx,
  msgEvt,
  modelGame,
}: {
  ctx: SpaceCtx;
  msgEvt: WithEventMeta<MsgGame>;
  modelGame: ModelGame;
}): ModelGame => {
  switch (msgEvt.t) {
    case "play": {
      switch (modelGame.t) {
        case "play": {
          return {
            t: "play",
            c: Play.reducer({
              ctx,
              msgEvt: msgEvt.c,
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
              msgEvt: msgEvt.c,
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
      if (msgEvt.userId !== ctx.space.hostId) {
        return modelGame;
      }

      switch (msgEvt.mode) {
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
