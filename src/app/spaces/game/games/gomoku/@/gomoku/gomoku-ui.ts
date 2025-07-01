import { h } from '~/@/vdom/h'
import { Hex } from '~/@/hex/hex'
import { cn } from '~/@/ui/cn'
import { type Board, type Bounds, type Stone, allPositions, bounds, presetToStars } from './gomoku'
import type { Position } from './gomoku-position'

const backgroundColor = '#C88655'
const lineColor = Hex.darken(backgroundColor, 0.3)
const gameTheme = {
  whiteStone: 'white',
  blackStone: 'black',
  background: backgroundColor,
  line: lineColor,
}

export const stoneToColor = (stone: Stone): string => {
  switch (stone) {
    case 'black':
      return gameTheme.blackStone

    case 'white':
      return gameTheme.whiteStone
  }
}

export const viewStoneIcon = ({ stone }: { stone: Stone }) => {
  return h('svg', { viewBox: '-1 -1 2 2' }, [
    h('circle', {
      cx: 0,
      cy: 0,
      r: 0.9,
      fill: stoneToColor(stone),
      strokeWidth: 0.1,
      stroke: '#454545',
    }),
  ])
}

export const CoverArt = (input: { className?: string }) => {
  return h(ViewBoard, {
    ...input,
    viewBoxOffset: 0.5,
    bounds: {
      lower: {
        x: 0,
        y: 0,
      },
      upper: {
        x: 6,
        y: 6,
      },
    },
    board: {
      2: {
        2: 'black',
        3: 'white',
      },
      3: {
        2: 'black',
        3: 'white',
      },
      4: {
        2: 'white',
        3: 'black',
      },
    },
  })
}

export const ViewBoard = ({
  onPress,
  board,
  bounds: bounds_ = bounds,
  viewBoxOffset = 0.8,
  className,
}: {
  className?: string
  board: Board
  onPress?: (position: Position) => void
  bounds?: Bounds
  viewBoxOffset?: number
}) => {
  const boundsView = {
    lower: {
      x: bounds_.lower.x - viewBoxOffset,
      y: bounds_.lower.y - viewBoxOffset,
    },
    upper: {
      x: bounds_.upper.x - 1 + viewBoxOffset,
      y: bounds_.upper.y - 1 + viewBoxOffset,
    },
  }

  const stars = presetToStars['9x9'].map((pos) => pos)

  const width = boundsView.upper.x - boundsView.lower.x
  const height = boundsView.upper.y - boundsView.lower.y

  const viewBox = [boundsView.lower.x, boundsView.lower.y, width, height].join(' ')

  return h(
    'svg',
    {
      width: '100%',
      viewBox,
      className: cn('overflow-hidden', className),
    },
    [
      h('g', { strokeWidth: 0.05 }, [
        h('rect', {
          x: boundsView.lower.x,
          y: boundsView.lower.y,
          width,
          height,
          fill: gameTheme.background,
        }),

        h('g', { stroke: gameTheme.line }, [
          h('rect', {
            x: bounds_.lower.x,
            y: bounds_.lower.y,
            width: bounds_.upper.x - 1 - bounds_.lower.x,
            height: bounds_.upper.y - 1 - bounds_.lower.y,
            fill: gameTheme.background,
          }),
          ...range({
            lower: 1,
            upper: bounds_.upper.y,
          }).map((x) =>
            h('line', {
              key: `x${x}`,
              x1: x,
              y1: bounds_.lower.y,
              x2: x,
              y2: bounds_.upper.y - 1,
            }),
          ),
          ...range({
            lower: 1,
            upper: bounds.upper.x,
          }).map((y) =>
            h('line', {
              key: `y${y}`,
              x1: bounds_.lower.x,
              y1: y,
              x2: bounds_.upper.x - 1,
              y2: y,
            }),
          ),
        ]),

        h(
          'g',
          {},
          stars.map((pos) =>
            h('circle', {
              key: [pos.x, pos.y].join(', '),
              cx: pos.x,
              cy: pos.y,
              r: 0.12,
              fill: gameTheme.line,
            }),
          ),
        ),

        ...allPositions.flatMap(({ x, y }) => {
          const stone = board[x]?.[y] ?? null
          if (!stone) {
            return []
          }

          return [
            h('circle', {
              key: [x, y, stone].join('-'),
              cx: x,
              cy: y,
              r: 0.45,
              fill: stoneToColor(stone),
            }),
          ]
        }),

        h(
          'g',
          {},
          allPositions.map(({ x, y }) =>
            h('circle', {
              key: [x, y].join(', '),
              cx: x,
              cy: y,
              r: 0.5,
              fill: 'transparent',
              onClick: () =>
                onPress?.({
                  x,
                  y,
                }),
              className: 'cursor-pointer',
            }),
          ),
        ),
      ]),
    ],
  )
}

const range = ({ lower, upper }: { lower: number; upper: number }): number[] => {
  const range: number[] = []
  for (let n = lower; n < upper; n++) {
    range.push(n)
  }
  return range
}
