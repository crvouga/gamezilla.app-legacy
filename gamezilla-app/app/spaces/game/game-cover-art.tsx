import * as ConnectFour from "./connect-four/connect-four-cover-art"
import * as Flow from "./flow/flow-cover-art"

import { GameName } from "./game.core"

export const CoverArt = (input: { gameName: GameName }) => {
  switch (input.gameName) {
    case "connect-four": {
      return <ConnectFour.CoverArt />
    }

    case "flow": {
      return <Flow.CoverArt />
    }

    default: {
      const check: never = input.gameName
      return check
    }
  }
}
