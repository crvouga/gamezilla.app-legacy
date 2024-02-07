import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { isErr } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleName } from "../../../@SHARED/flow-puzzle/flow-puzzle-name";
import { ModelGame, MsgGame } from "../builder.core";

const reducer = ({
  modelGame,
  msgGame,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}): ModelGame => {
  if (modelGame.t !== "build") {
    return modelGame;
  }
  switch (msgGame.t) {
    case "user-edited-puzzle-name": {
      if (msgGame.flowPuzzleId !== modelGame.puzzle.id) {
        return modelGame;
      }
      if (msgGame.edited.t === "err") {
        return modelGame;
      }
      if (!FlowPuzzleName.is(msgGame.newName)) {
        return modelGame;
      }
      const puzzleNew: FlowPuzzle = {
        ...modelGame.puzzle,
        name: msgGame.newName,
      };
      return {
        ...modelGame,
        puzzle: puzzleNew,
      };
    }

    case "user-saved-changes": {
      if (isErr(msgGame.saved)) {
        return modelGame;
      }
      return { ...modelGame, puzzle: msgGame.saved.value };
    }

    default: {
      return modelGame;
    }
  }
};

export const PuzzleEditGame = {
  reducer,
};
