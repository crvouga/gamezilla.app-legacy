import { isErr } from "gamezilla/@SHARED/core";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow";
import { GameReducer } from "../../builder.core";

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-created-puzzle": {
      if (isErr(msgGame.created)) {
        return modelGame;
      }
      const puzzleNew = msgGame.created.value;
      return {
        ...modelGame,
        t: "puzzle-builder",
        mode: { t: "edit" },
        gridEdit: FlowGridUIEdit.init({ grid: puzzleNew.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: puzzleNew.puzzle.c }),
        puzzle: puzzleNew,
      };
    }

    default: {
      return modelGame;
    }
  }
};

export const PuzzleCreateGame = { reducer };
