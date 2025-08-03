import { Uuid } from '~/@/id/uuid'
import { h } from '~/@/vdom/h'
import { Rect } from '~/@/vdom/primitives/svg/rect'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from '../connect-four'
import { gameTheme } from './shared'
import { Defs } from '~/@/vdom/primitives/svg/defs'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { Pattern } from '~/@/vdom/primitives/svg/pattern'
import { Mask } from '~/@/vdom/primitives/svg/mask'
import { LinearGradient } from '~/@/vdom/primitives/svg/linear-gradient'
import { Stop } from '~/@/vdom/primitives/svg/stop'

const coverArtId = Uuid.generate()

export const CoverArt = (input: { style?: Record<string, unknown> }) => {
  const ids = {
    playerOneGradient: `playerOneGradient${coverArtId}`,
    playerTwoGradient: `playerTwoGradient${coverArtId}`,
    holePattern: `holePattern${coverArtId}`,
    columnGradient: `columnGradient${coverArtId}`,
    holeMask: `holeMask${coverArtId}`,
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return h(Svg, { width: '100%', viewBox: '0 0 2 2', style: input.style }, [
    h(Defs, {}, [
      h(Pattern, { id: ids.holePattern, patternUnits: 'userSpaceOnUse', width: 1, height: 1 }, [
        h(Circle, { cx: 0.5, cy: 0.5, r: 0.425, fill: 'black' }),
      ]),

      h(Mask, { id: ids.holeMask }, [
        h(Rect, { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: 'white' }),
        h(Rect, { x: 0, y: 0, width: COLUMN_COUNT, height: MAX_COLUMN_HEIGHT, fill: `url(#${ids.holePattern})` }),
      ]),

      h(LinearGradient, { id: ids.columnGradient, 'gradient-transform': 'rotate(90)' }, [
        h(Stop, { offset: '0%', 'stop-color': gameTheme.primary.light }),
        h(Stop, { offset: '100%', 'stop-color': gameTheme.primary.dark }),
      ]),

      h(LinearGradient, { id: ids.playerOneGradient, 'gradient-transform': 'rotate(90)' }, [
        h(Stop, { offset: '0%', 'stop-color': gameTheme['player-one'].light }),
        h(Stop, { offset: '100%', 'stop-color': gameTheme['player-one'].dark }),
      ]),

      h(LinearGradient, { id: ids.playerTwoGradient, 'gradient-transform': 'rotate(90)' }, [
        h(Stop, { offset: '0%', 'stop-color': gameTheme['player-two'].light }),
        h(Stop, { offset: '100%', 'stop-color': gameTheme['player-two'].dark }),
      ]),
    ]),

    h(Rect, { x: 0, y: 0, width: 2, height: 2, fill: gameTheme.primary.darker }),

    h(Circle, { cx: 0.5, cy: 0, r: 0.5, fill: playerOneFill }),

    h(Circle, { cx: 1.5, cy: 0.5, r: 0.5, fill: playerTwoFill }),

    h(Circle, { cx: 1.5, cy: 1.5, r: 0.5, fill: playerOneFill }),

    h(Circle, { cx: 0.5, cy: 1.5, r: 0.5, fill: playerTwoFill }),

    h(Rect, {
      x: 0,
      y: 0,
      width: COLUMN_COUNT,
      height: MAX_COLUMN_HEIGHT,
      fill: `url(#${ids.columnGradient})`,
      mask: `url(#${ids.holeMask})`,
    }),
  ])
}
