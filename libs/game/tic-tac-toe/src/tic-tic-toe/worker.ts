import { expose } from 'threads/worker';
import * as TicTacToe from './tic-tac-toe';

const worker: TicTacToe.Worker = {
  toBestMove: TicTacToe.toBestMove,
};

expose(worker);
