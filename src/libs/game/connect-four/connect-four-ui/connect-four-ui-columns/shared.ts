import { ColumnIndex, Columns, PlayerType } from "../../connect-four";

export type ViewColumnsProps = {
  columns: Columns;
  ghost?: { columnIndex: ColumnIndex; playerType: PlayerType };
  onClick?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean;
  gameId: string | number | null | undefined;
};
