import { Cmd } from "@gamezilla/core";
import { ChessBoardInstance, ChessBoard } from "chessboardjs";
import { Color, Model, MoveInput, Piece, Square } from "../chess";

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
  id: string;
  onDrop: () => boolean;
};

let instance: ChessBoardInstance | null;

export const init = (config: Config): { cmd: Cmd } => {
  return {
    cmd: () => {
      instance = ChessBoard(config.id, {
        draggable: true,
        sparePieces: true,
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
      if (!instance) {
        return;
      }
      if (
        instance.orientation() === "white" &&
        props?.boardOrientation === "b"
      ) {
        instance.flip();
      }
      instance.position(props.model.fen);
    },
  };
};

export const View = ({ id }: { id: string }) => {
  return <div className="w-full" id={id}></div>;
};
