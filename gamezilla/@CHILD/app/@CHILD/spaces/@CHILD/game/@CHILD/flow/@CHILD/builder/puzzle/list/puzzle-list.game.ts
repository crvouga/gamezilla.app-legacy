import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow";
import { GameReducer } from "../../builder.core";

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-opened-puzzle": {
      return {
        ...modelGame,
        t: "puzzle-builder",
        gridEdit: FlowGridUIEdit.init({ grid: msgGame.puzzle.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: msgGame.puzzle.puzzle.c }),
        mode: { t: "edit" },
        puzzle: msgGame.puzzle,
      };
    }

    case "listed-puzzles": {
      return modelGame;
    }

    default: {
      return modelGame;
    }
  }
};

export const PuzzeListGame = { reducer };
