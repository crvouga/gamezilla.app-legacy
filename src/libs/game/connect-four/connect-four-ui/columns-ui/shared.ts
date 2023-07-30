import { VDom } from "@gamezilla/ui";
import { ColumnIndex, Columns, PlayerType } from "../../connect-four";
import { Model } from "./columns-ui";

export type ViewColumnsProps = {
  columns: Columns;
  model?: Model;
  ghost?: { columnIndex: ColumnIndex; playerType: PlayerType };
  onClick?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean;
  gameId?: string | number | null;
  gameOverOverlay?: () => VDom | VDom[] | null;
};
