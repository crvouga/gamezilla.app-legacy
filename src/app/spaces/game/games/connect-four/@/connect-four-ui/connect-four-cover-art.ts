import { Uuid } from '~/@/id/uuid'
import { h } from '~/@/vdom/h'
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

  return h('svg', { width: '100%', viewBox: '0 0 2 2', ...input }, [
    h('defs', {}, [
      h('pattern', { id: ids.holePattern, patternUnits: 'userSpaceOnUse', width: 1, height: 1 }, [
        h('circle', { cx: 0.5, cy: 0.5, r: 0.425, fill: 'black' }),
      ]),

      h('mask', { id: ids.holeMask }, [
        h('rect', { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: 'white' }),
        h('rect', { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: `url(#${ids.holePattern})` }),
      ]),

      h('linearGradient', { id: ids.columnGradient, gradientTransform: 'rotate(90)' }, [
        h('stop', { offset: '0%', stopColor: gameTheme.primary.light }),
        h('stop', { offset: '100%', stopColor: gameTheme.primary.dark }),
      ]),

      h('linearGradient', { id: ids.playerOneGradient, gradientTransform: 'rotate(90)' }, [
        h('stop', { offset: '0%', stopColor: gameTheme['player-one'].light }),
        h('stop', { offset: '100%', stopColor: gameTheme['player-one'].dark }),
      ]),

      h('linearGradient', { id: ids.playerTwoGradient, gradientTransform: 'rotate(90)' }, [
        h('stop', { offset: '0%', stopColor: gameTheme['player-two'].light }),
        h('stop', { offset: '100%', stopColor: gameTheme['player-two'].dark }),
      ]),
    ]),

    h('rect', { x: 0, y: 0, width: 2, height: 2, fill: gameTheme.primary.darker }),

    h('circle', { cx: 0.5, cy: 0, r: 0.5, fill: playerOneFill }),

    h('circle', { cx: 1.5, cy: 0.5, r: 0.5, fill: playerTwoFill }),

    h('circle', { cx: 1.5, cy: 1.5, r: 0.5, fill: playerOneFill }),

    h('circle', { cx: 0.5, cy: 1.5, r: 0.5, fill: playerTwoFill }),

    h('rect', {
      x: 0,
      y: 0,
      width: COLUMN_COUNT,
      height: MAX_COLUMN_HEIGHT,
      fill: `url(#${ids.columnGradient})`,
      mask: `url(#${ids.holeMask})`,
    }),
  ])
}
