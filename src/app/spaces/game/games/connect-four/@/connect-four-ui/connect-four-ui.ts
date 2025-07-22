import { Uuid } from '~/@/id/uuid'
import { h } from '~/@/vdom/h'
import type { PlayerType } from '../connect-four'
import { gameTheme } from './shared'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { RadialGradient } from '~/@/vdom/primitives/svg/radial-gradient'
import { Stop } from '~/@/vdom/primitives/svg/stop'

export const PlayerIcon = ({ playerType, ...input }: { playerType: PlayerType; key?: string; class?: string }) => {
  switch (playerType) {
    case 'player-one': {
      return h(PlayerOneIcon, input)
    }

    case 'player-two': {
      return h(PlayerTwoIcon, input)
    }
  }
}

export const ViewPlayerOneGradientDef = ({
  gradientId,
  cx,
  cy,
  r,
}: {
  gradientId: string
  cx: number
  cy: number
  r: number
}) => {
  return h(RadialGradient, { id: gradientId, gradientTransform: 'rotate(90)', cx, cy, r }, [
    h(Stop, { offset: '50%', stopColor: gameTheme['player-one'].light }),
    h(Stop, { offset: '100%', stopColor: gameTheme['player-one'].dark }),
  ])
}

export const ViewPlayerTwoGradientDef = ({ gradientId }: { gradientId: string }) => {
  return h(RadialGradient, { id: gradientId, gradientTransform: 'rotate(90)' }, [
    h(Stop, { offset: '50%', stopColor: gameTheme['player-two'].light }),
    h(Stop, { offset: '100%', stopColor: gameTheme['player-two'].dark }),
  ])
}

export const PlayerOneIcon = (input: { key?: string; class?: string }) => {
  const playerOneId = Uuid.generate()
  return h(Svg, { viewBox: '-1 -1 2 2', ...input }, [
    h(ViewPlayerOneGradientDef, { cx: 0, cy: 0, r: 1, gradientId: playerOneId }),
    h(Circle, { cx: 0, cy: 0, r: 1, fill: `url(#${playerOneId})` }),
  ])
}

export const PlayerTwoIcon = (input: { key?: string; class?: string }) => {
  const playerTwoId = Uuid.generate()
  return h(Svg, { viewBox: '-1 -1 2 2', ...input }, [
    h(ViewPlayerTwoGradientDef, { gradientId: playerTwoId }),
    h(Circle, { cx: 0, cy: 0, r: 1, fill: `url(#${playerTwoId})` }),
  ])
}
