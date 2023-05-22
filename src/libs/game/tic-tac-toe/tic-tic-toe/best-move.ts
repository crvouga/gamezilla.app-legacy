import { Err, Result, Task } from "@gamezilla/shared/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as threads from "threads";
import { WorkerAPI } from "./best-move-worker";
import { Board, PlayerType, Position } from "./tic-tac-toe";

export type GetBestMoveResult = Result<string, Position>;

export const getBestMove =
  (input: {
    depth: number;
    maximizingPlayer: PlayerType;
    board: Board;
  }): Task<GetBestMoveResult> =>
  async () => {
    try {
      const worker = new threads.Worker("./best-move-worker.ts");
      try {
        const spawned = await threads.spawn<WorkerAPI>(worker);
        const moved = await spawned.toBestMove(input);

        return moved;
      } catch (error) {
        console.log(error);
        return Err(`Spawn worker error. ${String(error)}`);
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      console.log(error);
      return Err(`New worker error. ${String(error)}`);
    }
  };
