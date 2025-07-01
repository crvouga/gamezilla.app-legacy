import { Uuid } from '~/@/id/uuid'
import { v } from '~/@/vdom/v'
import type { PlayerType } from '../connect-four'
import { gameTheme } from './shared'

export const PlayerIcon = ({ playerType, ...input }: { playerType: PlayerType; key?: string; class?: string }) => {
  switch (playerType) {
    case 'player-one': {
      return v(PlayerOneIcon, input)
    }

    case 'player-two': {
      return v(PlayerTwoIcon, input)
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
  return v('radialGradient', { id: gradientId, gradientTransform: 'rotate(90)', cx, cy, r }, [
    v('stop', { offset: '50%', stopColor: gameTheme['player-one'].light }),
    v('stop', { offset: '100%', stopColor: gameTheme['player-one'].dark }),
  ])
}

export const ViewPlayerTwoGradientDef = ({ gradientId }: { gradientId: string }) => {
  return v('radialGradient', { id: gradientId, gradientTransform: 'rotate(90)' }, [
    v('stop', { offset: '50%', stopColor: gameTheme['player-two'].light }),
    v('stop', { offset: '100%', stopColor: gameTheme['player-two'].dark }),
  ])
}

export const PlayerOneIcon = (input: { key?: string; class?: string }) => {
  const playerOneId = Uuid.generate()
  return v('svg', { viewBox: '-1 -1 2 2', ...input }, [
    v(ViewPlayerOneGradientDef, { cx: 0, cy: 0, r: 1, gradientId: playerOneId }),
    v('circle', { cx: 0, cy: 0, r: 1, fill: `url(#${playerOneId})` }),
  ])
}

export const PlayerTwoIcon = (input: { key?: string; class?: string }) => {
  const playerTwoId = Uuid.generate()
  return v('svg', { viewBox: '-1 -1 2 2', ...input }, [
    v(ViewPlayerTwoGradientDef, { gradientId: playerTwoId }),
    v('circle', { cx: 0, cy: 0, r: 1, fill: `url(#${playerTwoId})` }),
  ])
}
