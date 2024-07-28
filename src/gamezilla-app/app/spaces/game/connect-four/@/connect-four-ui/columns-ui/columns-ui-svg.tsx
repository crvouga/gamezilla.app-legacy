import { cn } from 'gamezilla-app/app/@/ui'
import { COLUMN_COUNT, type Columns, MAX_COLUMN_HEIGHT, type Pos2d, isColumnIndex, winToId } from '../../connect-four'
import { gameTheme } from '../shared'
import type { Model, ViewColumnsinput } from './shared'

type SvgIds = {
  playerOneGradient: string
  playerTwoGradient: string
  holePattern: string
  columnGradient: string
  holeMask: string
}

const randomId = Math.random()
const ids = {
  playerOneGradient: `playerOneGradient${randomId}`,
  playerTwoGradient: `playerTwoGradient${randomId}`,
  holePattern: `holePattern${randomId}`,
  columnGradient: `columnGradient${randomId}`,
  holeMask: `holeMask${randomId}`
}

export const ViewColumnsSvg = ({
  id,
  columns,
  onClick,
  onHover,
  disabled,
  model
}: ViewColumnsinput & { id: string }) => {
  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg id={id} width='100%' viewBox={`0 0 ${COLUMN_COUNT} ${MAX_COLUMN_HEIGHT}`}>
      <SvgDefs ids={ids} />

      <g transform={`translate(0, ${MAX_COLUMN_HEIGHT}) scale(1,-1)`}>
        <rect x={0} y={0} width={COLUMN_COUNT} height={MAX_COLUMN_HEIGHT} fill={gameTheme.primary.darker} />

        <g transform='translate(0.5, 0.5)'>
          {model?.discs?.map(({ item: disc, state }) => {
            return (
              <circle
                id={disc.id}
                key={disc.id}
                cx={disc.x}
                cy={state === 'entered' ? disc.y : -1}
                r={0.5}
                fill={disc.player === 'player-one' ? playerOneFill : playerTwoFill}
              />
            )
          })}
        </g>

        <rect
          x={0}
          y={0}
          width={COLUMN_COUNT}
          height={MAX_COLUMN_HEIGHT}
          fill={`url(#${ids.columnGradient})`}
          mask={`url(#${ids.holeMask})`}
        />

        <ViewWins model={model} columns={columns} />

        {[...new Array(COLUMN_COUNT)].map((_, columnIndex) => (
          <rect
            className={cn(
              disabled || !onClick
                ? undefined
                : (columns[columnIndex]?.length ?? 0) >= MAX_COLUMN_HEIGHT
                ? 'cursor-not-allowed'
                : 'cursor-pointer'
            )}
            onMouseOver={() => {
              if (!disabled && isColumnIndex(columnIndex) && onHover) {
                onHover(columnIndex)
              }
            }}
            onClick={() => {
              if (!disabled && isColumnIndex(columnIndex) && onClick) {
                onClick(columnIndex)
              }
            }}
            key={columnIndex}
            x={columnIndex}
            y={0}
            width={1}
            height={MAX_COLUMN_HEIGHT}
            fill='transparent'
          />
        ))}
      </g>
    </svg>
  )
}

/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const n = 1000

const distance = (a: Pos2d, b: Pos2d): number => ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5

const angleBetween = (a: Pos2d, b: Pos2d): number => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI

const ViewWins = ({ model }: { model?: Model; columns: Columns }) => {
  return (
    <svg
      x={0}
      y={0}
      width={COLUMN_COUNT}
      height={MAX_COLUMN_HEIGHT}
      viewBox={`0 0 ${COLUMN_COUNT * n} ${MAX_COLUMN_HEIGHT * n}`}
    >
      {model?.wins.flatMap(({ item: win }, i) => {
        const westMost = win[0]
        const eastMost = win[win.length - 1]
        if (!eastMost) {
          return []
        }

        const theta = angleBetween(westMost, eastMost)
        const originX = (westMost.x + 0.5) * n
        const originY = (westMost.y + 0.5) * n
        const width = (distance(westMost, eastMost) + 1) * n
        return [
          <rect
            key={i}
            id={winToId(win)}
            transform={`rotate(${theta} ${originX} ${originY})`}
            x={westMost.x * n}
            y={westMost.y * n}
            width={width}
            height={n}
            rx={n / 2}
            stroke='transparent'
            fill='transparent'
            strokeWidth={n / 8}
            className='pointer-events-none'
          />
        ]
      })}
    </svg>
  )
}

const SvgDefs = ({ ids }: { ids: SvgIds }) => {
  return (
    <defs>
      <pattern id={ids.holePattern} patternUnits='userSpaceOnUse' width={1} height={1}>
        <circle cx={0.5} cy={0.5} r={0.425} fill='black' />
      </pattern>

      <mask id={ids.holeMask}>
        <rect x={0} y={0} width={COLUMN_COUNT} height={MAX_COLUMN_HEIGHT} fill='white' />
        <rect x={0} y={0} width={COLUMN_COUNT} height={MAX_COLUMN_HEIGHT} fill={`url(#${ids.holePattern})`} />
      </mask>

      <linearGradient id={ids.columnGradient} gradientTransform='rotate(90)'>
        <stop offset='0%' stopColor={gameTheme.primary.light} />
        <stop offset='100%' stopColor={gameTheme.primary.dark} />
      </linearGradient>

      <linearGradient id={ids.playerOneGradient} gradientTransform='rotate(90)'>
        <stop offset='0%' stopColor={gameTheme['player-one'].light} />
        <stop offset='100%' stopColor={gameTheme['player-one'].dark} />
      </linearGradient>

      <linearGradient id={ids.playerTwoGradient} gradientTransform='rotate(90)'>
        <stop offset='0%' stopColor={gameTheme['player-two'].light} />
        <stop offset='100%' stopColor={gameTheme['player-two'].dark} />
      </linearGradient>
    </defs>
  )
}
