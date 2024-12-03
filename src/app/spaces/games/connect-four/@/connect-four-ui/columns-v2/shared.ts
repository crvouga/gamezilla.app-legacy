import { PubSub } from '~/@/core'
import type { VDom } from '~/@/vdom'
import type { ColumnIndex, Columns, PlayerType } from '../../connect-four'

export type Columnsinput = {
  columns: Columns
  ghost?: {
    columnIndex: ColumnIndex
    playerType: PlayerType
  }
  onDropDisc?: (columnIndex: ColumnIndex) => void
  onHover?: (columnINdex: ColumnIndex) => void
  disabled?: boolean
  gameId?: string | number | null
  gameOverOverlay?: () => VDom | VDom[] | null
}

export const columnsinputSub = PubSub.create<Columnsinput>()
