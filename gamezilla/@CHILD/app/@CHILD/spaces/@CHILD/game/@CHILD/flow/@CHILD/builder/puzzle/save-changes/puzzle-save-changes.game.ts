import { isErr } from "gamezilla/@SHARED/core"
import { GameReducer } from "../../builder.core"

const reducer: GameReducer = ({ modelGame, msgGame }) => {
    switch (msgGame.t) {
        case "user-saved-changes": {
            if (isErr(msgGame.saved)) {
                return modelGame
            }
            return { ...modelGame, puzzle: msgGame.saved.value }
        }

        default: {
            return modelGame
        }
    }
}

export const PuzzleSaveChangesGame = {
    reducer,
}
