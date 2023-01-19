import { expose } from 'threads/worker';
import * as Board from './chess-board';

export type BoardWorker = {
  toBestMove: typeof Board.toBestMoveInput;
};

const worker: BoardWorker = {
  toBestMove: Board.toBestMoveInput,
};

expose(worker);
