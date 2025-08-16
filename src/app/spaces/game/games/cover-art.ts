import { IPlatform } from '~/@/platform/platform'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { GameName } from './@/game-name'
import * as ConnectFour from './connect-four/connect-four-cover-art'
import * as Numberlink from './numberlink/cover-art'

export const GameCoverArt = (props: {
  style?: Record<string, unknown>
  rounded?: boolean
  gameName: GameName
  platform: IPlatform
}) => {
  return h(GameCoverArtSwitch, {
    style: {
      ...sx({
        aspectRatio: 1,
        overflow: 'hidden',
        rounded: 'lg',
        borderWidth: 1,
        borderColor: 'neutral-700',
      }),
      ...props.style,
    },
    gameName: props.gameName,
    platform: props.platform,
  })
}

const GameCoverArtSwitch = (props: {
  style?: Record<string, unknown>
  gameName: GameName
  platform: IPlatform
}): VDom => {
  switch (props.gameName) {
    case 'connect-four':
      return h(ConnectFour.CoverArt, props)
    case 'numberlink':
      return h(Numberlink.CoverArt, props)
    case 'chess':
    case 'gomoku':
    case 'tic-tac-toe':
      return null
  }
}
