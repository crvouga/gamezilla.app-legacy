import { Err, Result, Task } from "@gamezilla/shared/core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Worker as ThreadsWorker, spawn } from "threads";
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const path = `${__dirname}/best-move-worker.ts`;
      console.log({ path, __filename });
      const worker = new ThreadsWorker(path);
      try {
        const spawned = await spawn<WorkerAPI>(worker);
        const moved = await spawned.toBestMove(input);

        return moved;
      } catch (error) {
        return Err(`Spawn worker error. ${String(error)}`);
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      return Err(`New worker error. ${String(error)}`);
    }
  };
