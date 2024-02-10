import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
    switch (msgGame.t) {
        case "user-deleted-puzzle": {
            return {
                t: "list",
                listTab: "puzzles",
            }
        }
        default: {
            return modelGame
        }
    }
}

export const PuzzleDeleteForeverGame = {
    reducer,
}
