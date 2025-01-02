import { PubSub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
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
