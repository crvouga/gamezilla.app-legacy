import { Err, Ok, Result, shuffle } from "@gamezilla/shared/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { expose } from "threads/worker";

import { Board, PlayerType, Position, allPositions, move } from "./tic-tac-toe";

const toBestMove = ({
  // depth,
  maximizingPlayer,
  board,
}: {
  depth: number;
  maximizingPlayer: PlayerType;
  board: Board;
}): Result<string, Position> => {
  for (let i = 0; i < 500_000; i++) {
    // working hard
    console.log("working hard");
  }
  for (const position of shuffle(String(Math.random()), allPositions)) {
    const moved = move({ board, player: maximizingPlayer, position });

    if (moved.t === "ok") {
      return Ok(position);
    }
  }

  return Err("no_valid_move");
};

const WorkerAPI = {
  toBestMove,
};

export type WorkerAPI = typeof WorkerAPI;

expose(WorkerAPI);
