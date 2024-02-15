import { PubSub } from "gamezilla/@SHARED/core"
import { ColumnIndex, Columns, PlayerType } from "../../connect-four"
import { VDom } from "gamezilla/@SHARED/vdom"

export type ColumnsProps = {
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

export const columnsPropsSub = PubSub.create<ColumnsProps>()
