import { Uuid } from '~/@/id/uuid'
import { v } from '~/@/vdom/v'
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from '../connect-four'
import { gameTheme } from './shared'

const coverArtId = Uuid.generate()

export const CoverArt = (input: { class?: string }) => {
  const ids = {
    playerOneGradient: `playerOneGradient${coverArtId}`,
    playerTwoGradient: `playerTwoGradient${coverArtId}`,
    holePattern: `holePattern${coverArtId}`,
    columnGradient: `columnGradient${coverArtId}`,
    holeMask: `holeMask${coverArtId}`,
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return v('svg', { width: '100%', viewBox: '0 0 2 2', ...input }, [
    v('defs', null, [
      v('pattern', { id: ids.holePattern, patternUnits: 'userSpaceOnUse', width: 1, height: 1 }, [
        v('circle', { cx: 0.5, cy: 0.5, r: 0.425, fill: 'black' }),
      ]),

      v('mask', { id: ids.holeMask }, [
        v('rect', { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: 'white' }),
        v('rect', { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: `url(#${ids.holePattern})` }),
      ]),

      v('linearGradient', { id: ids.columnGradient, gradientTransform: 'rotate(90)' }, [
        v('stop', { offset: '0%', stopColor: gameTheme.primary.light }),
        v('stop', { offset: '100%', stopColor: gameTheme.primary.dark }),
      ]),

      v('linearGradient', { id: ids.playerOneGradient, gradientTransform: 'rotate(90)' }, [
        v('stop', { offset: '0%', stopColor: gameTheme['player-one'].light }),
        v('stop', { offset: '100%', stopColor: gameTheme['player-one'].dark }),
      ]),

      v('linearGradient', { id: ids.playerTwoGradient, gradientTransform: 'rotate(90)' }, [
        v('stop', { offset: '0%', stopColor: gameTheme['player-two'].light }),
        v('stop', { offset: '100%', stopColor: gameTheme['player-two'].dark }),
      ]),
    ]),

    v('rect', { x: 0, y: 0, width: 2, height: 2, fill: gameTheme.primary.darker }),

    v('circle', { cx: 0.5, cy: 0, r: 0.5, fill: playerOneFill }),

    v('circle', { cx: 1.5, cy: 0.5, r: 0.5, fill: playerTwoFill }),

    v('circle', { cx: 1.5, cy: 1.5, r: 0.5, fill: playerOneFill }),

    v('circle', { cx: 0.5, cy: 1.5, r: 0.5, fill: playerTwoFill }),

    v('rect', {
      x: 0,
      y: 0,
      width: COLUMN_COUNT,
      height: MAX_COLUMN_HEIGHT,
      fill: `url(#${ids.columnGradient})`,
      mask: `url(#${ids.holeMask})`,
    }),
  ])
}
