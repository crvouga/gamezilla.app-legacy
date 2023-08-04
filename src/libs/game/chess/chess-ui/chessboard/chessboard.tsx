import { ChessboardReact } from "./chessboard-react";
import { BoardProps } from "./chessboard-shared";

export const Chessboard = (props: BoardProps) => {
  return <ChessboardReact {...props} />;
};
