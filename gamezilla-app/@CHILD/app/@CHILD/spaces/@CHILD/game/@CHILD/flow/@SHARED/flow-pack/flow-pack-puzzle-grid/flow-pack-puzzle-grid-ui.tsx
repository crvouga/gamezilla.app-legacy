import { IconPlus } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { VDom } from "gamezilla-app/@SHARED/vdom"

const COLUMN_COUNT = 5
const ROW_COUNT = 6

export const toIndex = ({ x, y }: { x: number; y: number }) => {
  return y * COLUMN_COUNT + x
}

export const ViewPackPuzzleGrid = ({
  renderCell,
}: {
  renderCell: ({ x, y }: { x: number; y: number }) => VDom
}) => {
  const columns: VDom[] = []
  for (let y = 0; y < ROW_COUNT; y++) {
    const row: VDom[] = []
    for (let x = 0; x < COLUMN_COUNT; x++) {
      row.push(
        <div
          key={`${y}-${x}`}
          className="flex aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16"
        >
          {renderCell({ x, y })}
        </div>,
      )
    }

    columns.push(
      <div key={y} className="flex w-full items-center justify-center">
        {row}
      </div>,
    )
  }

  return <div className="p-8">{columns}</div>
}

export const ViewAddCell = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-800 hover:opacity-90 active:opacity-80"
    >
      <IconPlus className="h-8 w-8" />
    </button>
  )
}

export const ViewPuzzleCell = ({
  onClick,
  index,
}: {
  onClick: () => void
  index: number
}) => {
  return (
    <button
      onClick={onClick}
      className="flex h-full w-full items-center justify-center overflow-hidden rounded  bg-neutral-800 text-xl font-bold hover:opacity-90 active:opacity-80"
    >
      {index + 1}
    </button>
  )
}

export const ViewEmptyCell = () => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-800 bg-neutral-950 opacity-70"></div>
  )
}

export const ViewLoadingCell = () => {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center overflow-hidden rounded bg-neutral-600 opacity-70"></div>
  )
}
