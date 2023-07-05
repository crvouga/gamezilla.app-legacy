import { ColumnIndex, Columns, PlayerType } from "../connect-four";

export const gameTheme = {
  primary: {
    light: "#1976D2",
    dark: "#2195F2",
    darker: "#0D47A1",
  },
  PlayerOne: {
    light: "#f45e55",
    dark: "#c12521",
  },
  PlayerTwo: {
    light: "#FFB74D",
    dark: "#ff9a06",
  },
};

export type ViewColumnsProps = {
  columns: Columns;
  ghost?: { columnIndex: ColumnIndex; playerType: PlayerType };
  onClick?: (columnIndex: ColumnIndex) => void;
  onHover?: (columnINdex: ColumnIndex) => void;
  disabled?: boolean;
};
