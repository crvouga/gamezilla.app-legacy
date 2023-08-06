import { Sub } from "@gamezilla/core";

export type ChessboardProps = {
  id: string;
  fen: string;
  "draggable-pieces"?: boolean;
};

type ChessboardEvent = ChessboardProps & {
  type: "props";
};

export const chessboardSub = Sub.create<ChessboardEvent>();
