import * as Chess from "./Chess/Chess"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"

export type Name = "TicTacToe" | "Snake" | "ConnectFour" | "Chess"

export const CoverArt = ({ gameName }: { gameName: Name }) => {
  switch (gameName) {
    case "ConnectFour": {
      return <ConnectFour.CoverArt id="connect-four-cover-art" />
    }

    case "Snake": {
      return <Snake.CoverArt />
    }

    case "TicTacToe": {
      return <TicTacToe.CoverArt />
    }

    case 'Chess': {
      return <Chess.CoverArt />
    }
  }
}

export { Chess, ConnectFour, Snake, TicTacToe }
