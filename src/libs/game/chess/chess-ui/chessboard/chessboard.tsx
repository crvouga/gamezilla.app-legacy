import "./chessboard-element";
import { ChessboardProps, chessboardSub } from "./chessboard-shared";

export const Chessboard = (props: ChessboardProps) => {
  chessboardSub.publish({ type: "props", ...props });
  return (
    <div className="aspect-square w-full overflow-hidden">
      <my-chess-board id={props.id}></my-chess-board>
    </div>
  );
};
