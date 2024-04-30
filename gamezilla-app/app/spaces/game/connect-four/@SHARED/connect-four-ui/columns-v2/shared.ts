import { PubSub } from "gamezilla-app/@shared/core"
import { VDom } from "gamezilla-app/@shared/vdom"
import { ColumnIndex, Columns, PlayerType } from "../../connect-four"

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
