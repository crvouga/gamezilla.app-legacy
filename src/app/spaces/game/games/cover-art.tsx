import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Flow from './flow/cover-art'

export const GameCoverArt = (input: { className?: string; gameName: GameName }) => {
  switch (input.gameName) {
    case 'connect-four': {
      return <ConnectFour.CoverArt className={input.className} />
    }

    case 'flow': {
      return <Flow.CoverArt className={input.className} />
    }

    default: {
      throw new Error(`Unknown game name: ${input.gameName}`)
    }
  }
}
