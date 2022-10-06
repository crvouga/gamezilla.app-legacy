import { expose } from "threads/worker"
import * as TicTacToe from "./TicTacToe"

export type TicTacToeWorker = {
  toBestMove: typeof TicTacToe.toBestMove
}

const worker: TicTacToeWorker = {
  toBestMove: TicTacToe.toBestMove,
}

expose(worker)
