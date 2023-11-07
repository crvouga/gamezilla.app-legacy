import { GameName } from "./game.core";
import * as ConnectFour from "./connect-four/connect-four-cover-art";

export const CoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "connect-four": {
      return <ConnectFour.CoverArt />;
    }

    // case "chess": {
    //   return <Chess.CoverArt />;
    // }
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
