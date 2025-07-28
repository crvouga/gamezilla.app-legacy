import { IPlatform } from '~/@/platform/platform'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Numberlink from './numberlink/cover-art'

export const GameCoverArt = (input: { rounded?: boolean; class?: string; gameName: GameName; platform: IPlatform }) => {
  return h(GameCoverArtSwitch, {
    class: cn(input.class, 'aspect-square', input.rounded && 'overflow-hidden rounded-lg border border-neutral-700'),
    gameName: input.gameName,
    platform: input.platform,
  })
}

const GameCoverArtSwitch = (input: { class?: string; gameName: GameName; platform: IPlatform }): VDom => {
  switch (input.gameName) {
    case 'connect-four':
      return h(ConnectFour.CoverArt, input)
    case 'numberlink':
      return h(Numberlink.CoverArt, input)
    case 'chess':
    case 'gomoku':
    case 'tic-tac-toe':
      return null
  }
}
