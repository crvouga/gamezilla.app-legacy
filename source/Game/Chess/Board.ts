import * as ChessTs from "chess.ts"
import { Result } from "../../Core"

//
//
// Model
//
//

export type Model = {
  fen: string
}

export type PlayerType = "White" | "Black"

export const init = (): Model => {
  return {
    fen: new ChessTs.Chess().fen(),
  }
}

//
//
// Selectors
//
//

export const inCheck = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).inCheck()
}

export const inDraw = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).inDraw()
}

export const inCheckmate = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).inCheckmate()
}

export const inStalemate = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).inStalemate()
}

//
//
// Move
//
//

export type MoveInput = ChessTs.PartialMove
export type MoveProblem = "invalid_move"

export const move = (
  MoveInput: MoveInput,
  model: Model,
): Result.Result<MoveProblem, Model> => {
  const chess = new ChessTs.Chess(model.fen)

  const moved = chess.move(MoveInput)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  return Result.Ok({
    ...model,
    fen: chess.fen(),
  })
}
