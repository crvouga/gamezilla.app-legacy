import "./chessboard-element";
import { ChessboardProps, chessboardSub } from "./chessboard-shared";

export const Chessboard = (props: ChessboardProps) => {
  chessboardSub.publish({
    type: "props",
    id: props.id,
    fen: props.fen,
    orientation: props.orientation,
    onDroppedPiece: props.onDroppedPiece,
  });
  return <my-chess-board id={props.id}></my-chess-board>;
};
