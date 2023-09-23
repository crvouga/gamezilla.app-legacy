import { err, ok } from "gamezilla/@SHARED/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { expose } from "threads/worker";
import { Model, PlayerType, allPositions, move } from "./tic-tac-toe";

const toBestMove = ({
  // depth,
  maximizingPlayer,
  board,
}: {
  depth: number;
  maximizingPlayer: PlayerType;
  board: Model;
}) => {
  for (const position of allPositions) {
    const moved = move({ board, player: maximizingPlayer, position });

    if (moved.t === "ok") {
      return ok(position);
    }
  }

  return err("no_valid_move");
};

const WorkerAPI = {
  toBestMove,
};

export type WorkerAPI = typeof WorkerAPI;

expose(WorkerAPI);
