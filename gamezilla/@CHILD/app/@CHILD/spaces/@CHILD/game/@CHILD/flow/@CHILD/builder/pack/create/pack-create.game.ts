import { GameReducer } from "../../builder.core";

const reducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    default: {
      return modelGame;
    }
  }
};

export const PackCreateGame = {
  reducer,
};
