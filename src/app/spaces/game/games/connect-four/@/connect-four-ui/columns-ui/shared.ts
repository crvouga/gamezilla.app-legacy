import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import type { ColumnIndex, Columns, PlayerType, Win } from '../../connect-four'
import { Transition } from '~/@/transition'

export type ViewColumnsInput = {
  columns: Columns
  model?: Model
  ghost?: {
    columnIndex: ColumnIndex
    playerType: PlayerType
  }
  onPressDown?: (columnIndex: ColumnIndex) => void
  onHover?: (columnINdex: ColumnIndex) => void
  disabled?: boolean
  gameId?: string | number | null
  gameOverOverlay?: () => VDom | VDom[] | null
}

export const columnsInputSub = Sub.create<ViewColumnsInput>()

export type Model = {
  discs: Transition.Model<Disc>
  wins: Transition.Model<Win>
}

export type Disc = {
  x: number
  y: number
  player: PlayerType
  id: string
}

export const toDiscs = (columns: Columns): Disc[] => {
  const discs: Disc[] = []
  for (let x = 0; x < columns.length; x++) {
    for (let y = 0; y < (columns[x]?.length ?? 0); y++) {
      const player = columns[x]?.[y]

      if (player) {
        const disc: Disc = {
          id: `${player}-${x}-${y}`,
          x,
          y,
          player,
        }
        discs.push(disc)
      }
    }
  }
  return discs
}
