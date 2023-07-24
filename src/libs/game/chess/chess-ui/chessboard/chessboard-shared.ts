import { Color, Model, MoveInput, Piece, Square } from "../../chess";

export type SquareStyle = {
  backgroundColor?: string;
};

export type CustomSquareStyles = {
  [key in Square]?: SquareStyle;
};

export const theme = {
  dark: "#779455",
  light: "#EBEBD0",
};

export type BoardProps = {
  boardOrientation: Color;
  model: Model;
  onPieceDrop?: (move: MoveInput) => boolean;
  isDraggablePiece?: ({ piece }: { piece: Piece }) => boolean;
  customSquareStyles?: CustomSquareStyles;
  arrows?: MoveInput[];
};
