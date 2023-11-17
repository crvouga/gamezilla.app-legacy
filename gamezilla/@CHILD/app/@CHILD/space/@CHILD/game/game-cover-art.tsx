import * as Chess from "./@CHILD/chess/chess-cover-art";
import * as ConnectFour from "./@CHILD/connect-four/connect-four-cover-art";
import { GameName } from "./game.core";

export const CoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "connect-four": {
      return <ConnectFour.CoverArt />;
    }

    case "chess": {
      return <Chess.CoverArt />;
    }

    // case "tic-tac-toe": {
    //   return <TicTacToe.CoverArt />;
    // }

    // case "flow": {
    //   return <Flow.CoverArt />;
    // }

    default: {
      const check: never = gameName;
      return check;
    }
  }
};
