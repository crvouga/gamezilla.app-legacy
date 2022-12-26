import { expose } from "threads/worker"
import * as TicTacToe from "./TicTacToe"

const worker: TicTacToe.Worker = {
  toBestMove: TicTacToe.toBestMove,
}

expose(worker)
