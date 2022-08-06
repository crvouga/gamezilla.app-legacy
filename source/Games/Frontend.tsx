import * as TicTacToe from "./TicTacToe/Frontend"
import * as ConnectFour from "./ConnectFour/Frontend"
import * as Snake from "./Snake/Frontend"
import * as UI from "../UI"
import { Name } from "./Types"

export const viewCoverArt =
  ({ gameName }: { gameName: Name }): UI.View<never> =>
  () => {
    switch (gameName) {
      case "ConnectFour": {
        return <ConnectFour.CoverArt id="" />
      }

      case "Snake": {
        return <Snake.CoverArt />
      }

      case "TicTacToe": {
        return <TicTacToe.CoverArt />
      }
    }
  }
