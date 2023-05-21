import { expose } from 'threads/worker';
import { WorkerAPI, toBestMove } from './tic-tac-toe';

const worker: WorkerAPI = {
  toBestMove,
};

expose(worker);
