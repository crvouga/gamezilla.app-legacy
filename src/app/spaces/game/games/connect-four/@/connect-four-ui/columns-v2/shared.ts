import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import type { ColumnIndex, Columns, PlayerType } from '../../connect-four'

export type ColumnsInput = {
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

export const columnsInputSub = Sub.init<ColumnsInput>()
