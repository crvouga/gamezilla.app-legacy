import { Uuid } from '~/@/id/uuid'
import { h } from '~/@/vdom/h'
import type { PlayerType } from '../connect-four'
import { gameTheme } from './shared'

export const PlayerIcon = ({ playerType, ...input }: { playerType: PlayerType; key?: string; className?: string }) => {
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
  return h('radialGradient', { id: gradientId, gradientTransform: 'rotate(90)', cx, cy, r }, [
    h('stop', { offset: '50%', stopColor: gameTheme['player-one'].light }),
    h('stop', { offset: '100%', stopColor: gameTheme['player-one'].dark }),
  ])
}

export const ViewPlayerTwoGradientDef = ({ gradientId }: { gradientId: string }) => {
  return h('radialGradient', { id: gradientId, gradientTransform: 'rotate(90)' }, [
    h('stop', { offset: '50%', stopColor: gameTheme['player-two'].light }),
    h('stop', { offset: '100%', stopColor: gameTheme['player-two'].dark }),
  ])
}

export const PlayerOneIcon = (input: { key?: string; className?: string }) => {
  const playerOneId = Uuid.generate()
  return h('svg', { viewBox: '-1 -1 2 2', ...input }, [
    h(ViewPlayerOneGradientDef, { cx: 0, cy: 0, r: 1, gradientId: playerOneId }),
    h('circle', { cx: 0, cy: 0, r: 1, fill: `url(#${playerOneId})` }),
  ])
}

export const PlayerTwoIcon = (input: { key?: string; className?: string }) => {
  const playerTwoId = Uuid.generate()
  return h('svg', { viewBox: '-1 -1 2 2', ...input }, [
    h(ViewPlayerTwoGradientDef, { gradientId: playerTwoId }),
    h('circle', { cx: 0, cy: 0, r: 1, fill: `url(#${playerTwoId})` }),
  ])
}
