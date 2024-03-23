import { Sub, Transition } from "gamezilla-app/@SHARED/core"

import { ColumnIndex, Columns, PlayerType, Win } from "../../connect-four"
import { VDom } from "gamezilla-app/@SHARED/vdom"

export type ViewColumnsProps = {
  columns: Columns
  model?: Model
  ghost?: { columnIndex: ColumnIndex; playerType: PlayerType }
  onClick?: (columnIndex: ColumnIndex) => void
  onHover?: (columnINdex: ColumnIndex) => void
  disabled?: boolean
  gameId?: string | number | null
  gameOverOverlay?: () => VDom | VDom[] | null
}

export const columnsPropsSub = Sub.create<ViewColumnsProps>()

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
