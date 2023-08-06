import { Sub } from "@gamezilla/core";
import { Color, Square } from "../../chess";

export type ChessboardProps = {
  id: string;
  fen?: string;
  "draggable-pieces"?: boolean;
  onDroppedPiece?: (input: { source: Square; target: Square }) => boolean;
  orientation?: Color;
};

type ChessboardEvent = ChessboardProps & {
  type: "props";
};

export const chessboardSub = Sub.create<ChessboardEvent>();
