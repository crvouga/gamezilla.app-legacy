import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Flow from './flow/flow-cover-art'

export const CoverArt = (input: { gameName: GameName }) => {
  switch (input.gameName) {
    case 'connect-four': {
      return <ConnectFour.CoverArt />
    }

    case 'flow': {
      return <Flow.CoverArt />
    }

    default: {
      throw new Error(`Unknown game name: ${input.gameName}`)
    }
  }
}
