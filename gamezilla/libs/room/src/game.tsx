import * as Chess from "@gamezilla/game/chess"
import * as ConnectFour from "@gamezilla/game/connect-four"
import * as Gomoku from "@gamezilla/game/gomoku"
import * as TicTacToe from "@gamezilla/game/tic-tac-toe"
import { GameName } from "./game.types-"

export const viewCoverArt = (gameName: GameName) => {
    switch (gameName) {
        case 'Chess': {
            return Chess.viewCoverArt()
        }

        case 'connect-four': {
            return <ConnectFour.ViewCoverArt />
        }

        case 'Gomoku': {
            return Gomoku.viewCoverArt()
        }

        case 'TicTacToe': {
            return TicTacToe.viewCoverArt()
        }
    }
}