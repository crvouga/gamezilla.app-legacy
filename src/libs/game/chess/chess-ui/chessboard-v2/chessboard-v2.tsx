import { Cmd, Transition } from "@gamezilla/core";
// import * as Chessboardjs from "@chrisoakman/chessboardjs";
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

export type Config = {
  onDrop: () => boolean;
};

// @ts-ignore
let instance: ChessBoardInstance | null;

const id = "chessboard";

export const init = (config: Config): { cmd: Cmd } => {
  return {
    cmd: async () => {
      const node = await Transition.waitForElementById(id);
      console.log({
        id,
        // @ts-ignore
        ChessBoard: window.ChessBoard,
      });
      // @ts-ignore
      instance = window.ChessBoard(node, {
        draggable: true,
        // sparePieces: true,
        // pieceTheme: "img/chess-pieces/alpha/{piece}.png",
        position: "start",
        onDrop() {
          return config.onDrop();
        },
      });

      //   watch for dismount then clean up
    },
  };
};

export const watch = (props: BoardProps): { cmd: Cmd } => {
  return {
    cmd: () => {
      // @ts-ignore
      if (!instance) {
        return;
      }
      // if (
      //   instance.orientation() === "white" &&
      //   props?.boardOrientation === "b"
      // ) {
      //   instance.flip();
      // }
      // @ts-ignore
      instance.position(props.model.fen);
    },
  };
};

export const View = () => {
  return (
    <div className="aspect-square w-full overflow-hidden">
      <div id={id}></div>;
    </div>
  );
};
