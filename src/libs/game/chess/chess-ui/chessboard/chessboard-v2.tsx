import { Cmd } from "@gamezilla/core";
import { ChessBoardInstance, ChessBoard } from "chessboardjs";

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

export const watch = ({ fen }: { fen: string }): { cmd: Cmd } => {
  return {
    cmd: () => {
      if (!instance) {
        return;
      }
      instance.position(fen);
    },
  };
};

export const View = ({ id }: { id: string }) => {
  return <div className="w-full" id={id}></div>;
};
