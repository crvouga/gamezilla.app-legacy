import { isErr } from "gamezilla/@SHARED/core";
import { GameReducer } from "../../builder.core";

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-created-pack": {
      if (isErr(msgGame.created)) {
        return modelGame;
      }
      return {
        t: "pack-builder",
        tab: "puzzles",
        pack: msgGame.created.value,
      };
    }

    case "user-exited-pack-builder": {
      return {
        t: "list",
        tab: "packs",
      };
    }

    default: {
      return modelGame;
    }
  }
};

export const PackBuilderGame = {
  reducer,
};
