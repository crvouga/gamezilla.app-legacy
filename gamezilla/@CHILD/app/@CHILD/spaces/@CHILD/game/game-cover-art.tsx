import * as ConnectFour from "./@CHILD/connect-four/connect-four-cover-art"
import * as Flow from "./@CHILD/flow/flow-cover-art"

import { GameName } from "./game.core"

export const CoverArt = ({ gameName }: { gameName: GameName }) => {
    switch (gameName) {
        case "connect-four": {
            return <ConnectFour.CoverArt />
        }

        case "flow": {
            return <Flow.CoverArt />
        }

        default: {
            const check: never = gameName
            return check
        }
    }
}
