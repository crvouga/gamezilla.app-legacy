import * as ChessTs from "chess.ts"
import { exhaustive, Result } from "../../Core"

//
//
// Model
//
//

export type Model = {
  fen: string
}

export type EndGame =
  | ["Win", "Resignation" | "Checkmate" | "Win On Time"]
  | ["Draw", "Stalemate" | "Draw by agreement" | "Threefold repetition"]

export type PlayerType = "White" | "Black"

export type Piece =
  | "wP"
  | "wB"
  | "wN"
  | "wR"
  | "wQ"
  | "wK"
  | "bP"
  | "bB"
  | "bN"
  | "bR"
  | "bQ"
  | "bK"

export const pieceToPlayerType = (piece: Piece): PlayerType => {
  switch (piece) {
    case "bB":
    case "bK":
    case "bN":
    case "bP":
    case "bQ":
    case "bR":
      return "Black"

    case "wB":
    case "wK":
    case "wN":
    case "wP":
    case "wQ":
    case "wR":
      return "White"

    default:
      return exhaustive(piece)
  }
}

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

export const insufficientMaterial = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).insufficientMaterial()
}

export const inThreefoldRepetition = (model: Model): boolean => {
  return new ChessTs.Chess(model.fen).inThreefoldRepetition()
}

export const toTurn = (model: Model): PlayerType => {
  const chess = new ChessTs.Chess(model.fen)

  const color = chess.turn()

  switch (color) {
    case "b":
      return "Black"

    case "w":
      return "White"
  }
}

export const toOppositePlayerType = (playerType: PlayerType): PlayerType => {
  switch (playerType) {
    case "Black":
      return "White"

    case "White":
      return "Black"
  }
}

//
//
// Move
//
//

export type MoveInput = ChessTs.PartialMove
export type MoveProblem = "invalid_move"

export const move = (
  moveInput: MoveInput,
  model: Model,
): Result.Result<MoveProblem, Model> => {
  const chess = new ChessTs.Chess(model.fen)

  const moved = chess.move(moveInput)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  return Result.Ok({
    fen: chess.fen(),
  })
}
