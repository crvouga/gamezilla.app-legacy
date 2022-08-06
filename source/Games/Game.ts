// import * as Chess from "./Chess"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe"

//
//
//
// Model
//
//
//

export type Model =
  | ["TicTacToe", TicTacToe.Game.Model]
  | ["ConnectFour", ConnectFour.Game.Model]
  // | ["Chess", Chess.Model]
  | ["Snake", Snake.Game.Model]

export type GameName = Model[0]

export const init = (gameName: GameName): Model => {
  switch (gameName) {
    // case "Chess":
    //   return ["Chess", Chess.init]

    case "ConnectFour":
      return ["ConnectFour", ConnectFour.Game.init]

    case "Snake":
      return ["Snake", Snake.Game.init]

    case "TicTacToe":
      return ["TicTacToe", TicTacToe.Game.init]
  }
}
