import { cn } from '~/@/ui/cn'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Numberlink from './numberlink/cover-art'
import { v } from '~/@/vdom/v'

export const GameCoverArt = (input: { rounded?: boolean; class?: string; gameName: GameName }) => {
  return v(GameCoverArtSwitch, {
    class: cn(input.class, 'aspect-square', input.rounded && 'overflow-hidden rounded-lg'),
    gameName: input.gameName,
  })
}

const GameCoverArtSwitch = (input: { class?: string; gameName: GameName }) => {
  switch (input.gameName) {
    case 'connect-four': {
      return v(ConnectFour.CoverArt, { class: input.class })
    }

    case 'numberlink': {
      return v(Numberlink.CoverArt, { class: input.class })
    }

    default: {
      throw new Error(`Unknown game name: ${input.gameName}`)
    }
  }
}
