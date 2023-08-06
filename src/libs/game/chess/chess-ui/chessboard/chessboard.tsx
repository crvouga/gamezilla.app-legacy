import "./chessboard-element";
import { ChessboardProps, chessboardSub } from "./chessboard-shared";

export const Chessboard = (props: ChessboardProps) => {
  chessboardSub.publish({ type: "props", id: props.id, fen: props.fen });
  return <my-chess-board id={props.id}></my-chess-board>;
};
