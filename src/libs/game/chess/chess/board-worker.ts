// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { expose } from "threads/worker";
import * as Chess from "./chess";

export type BoardWorker = {
  toBestMove: typeof Chess.toBestMoveInput;
};

const worker: BoardWorker = {
  toBestMove: Chess.toBestMoveInput,
};

expose(worker);
