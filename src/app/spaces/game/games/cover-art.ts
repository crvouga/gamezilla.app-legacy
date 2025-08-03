import { IPlatform } from '~/@/platform/platform'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Numberlink from './numberlink/cover-art'

export const GameCoverArt = (input: {
  style?: Record<string, unknown>
  rounded?: boolean
  gameName: GameName
  platform: IPlatform
}) => {
  return h(GameCoverArtSwitch, {
    style: {
      ...theme({ aspectRatio: 1, overflow: 'hidden', rounded: 'lg', borderWidth: 1, borderColor: 'neutral-700' }),
      ...input.style,
    },
    gameName: input.gameName,
    platform: input.platform,
  })
}

const GameCoverArtSwitch = (input: {
  style?: Record<string, unknown>
  gameName: GameName
  platform: IPlatform
}): VDom => {
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
