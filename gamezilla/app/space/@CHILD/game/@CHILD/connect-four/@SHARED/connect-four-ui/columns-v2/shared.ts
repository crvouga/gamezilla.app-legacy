import { Sub } from "gamezilla/@SHARED/core";
import { VDom } from "gamezilla/app/@SHARED/ui";
import { ColumnIndex, Columns, PlayerType } from "../../connect-four";

export type ColumnsProps = {
  columns: Columns;
  ghost?: {
    columnIndex: ColumnIndex;
    playerType: PlayerType;
  };
  onDropDisc?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean;
  gameId?: string | number | null;
  gameOverOverlay?: () => VDom | VDom[] | null;
};

export const columnsPropsSub = Sub.create<ColumnsProps>();
