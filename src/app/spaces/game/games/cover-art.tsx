import { cn } from '~/@/ui/cn'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Numberlink from './numberlink/cover-art'

export const GameCoverArt = (input: { rounded?: boolean; className?: string; gameName: GameName }) => {
  return (
    <GameCoverArtSwitch
      className={cn(input.className, 'aspect-square', input.rounded && 'overflow-hidden rounded-lg')}
      gameName={input.gameName}
    />
  )
}

const GameCoverArtSwitch = (input: { className?: string; gameName: GameName }) => {
  switch (input.gameName) {
    case 'connect-four': {
      return <ConnectFour.CoverArt className={input.className} />
    }

    case 'flow': {
      return <Numberlink.CoverArt className={input.className} />
    }

    default: {
      throw new Error(`Unknown game name: ${input.gameName}`)
    }
  }
}
