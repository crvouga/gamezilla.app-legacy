import { Sub } from "gamezilla/@/core";
import { Color, Piece, Square } from "../../chess";

export type ChessboardProps = {
  id: string;
  fen?: string;
  "draggable-pieces"?: boolean;
  onPieceDrop?: (input: { source: Square; target: Square }) => boolean;
  isPieceDraggable?: (input: { piece: Piece; square: Square }) => boolean;
  orientation?: Color;
};

type ChessboardEvent = ChessboardProps & {
  type: "props";
};

export const chessboardSub = Sub.create<ChessboardEvent>();
