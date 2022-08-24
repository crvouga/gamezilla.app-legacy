import * as ChessTs from "chess.ts"
import { exhaustive, Result } from "../../Core"

//
//
// Model
//
//

const createInstance = (model: Model) => {
  const instance = new ChessTs.Chess(model.fen)

  return instance
}

export type Model = {
  fen: string
  captures: Piece[]
}

export type EndGame =
  | ["Win", "Resignation" | "Checkmate" | "Win On Time"]
  | ["Draw", "Stalemate" | "Draw by agreement" | "Threefold repetition"]

export type PieceType = "P" | "B" | "N" | "R" | "Q" | "K"

export type Color = "w" | "b"

export type Piece = `${Color}${PieceType}`

export const toColor = (piece: Piece): Color => {
  switch (piece) {
    case "bB":
    case "bK":
    case "bN":
    case "bP":
    case "bQ":
    case "bR":
      return "b"

    case "wB":
    case "wK":
    case "wN":
    case "wP":
    case "wQ":
    case "wR":
      return "w"

    default:
      return exhaustive(piece)
  }
}

export const init = (): Model => {
  const chessInstance = new ChessTs.Chess()

  return {
    fen: chessInstance.fen(),
    captures: [],
    // pgn: chessInstance.pgn(),
  }
}

export const colorToString = (color: Color): string => {
  switch (color) {
    case "b": {
      return "Black"
    }

    case "w": {
      return "White"
    }
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

export const toMissingPieces = (model: Model) => {
  const instance = createInstance(model)
  return instance.history()
}

export const toTurn = (model: Model): Color => {
  const chess = new ChessTs.Chess(model.fen)

  return chess.turn()
}

export const toOppositeColor = (color: Color): Color => {
  switch (color) {
    case "b":
      return "w"

    case "w":
      return "b"
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
  const chessInstance = createInstance(model)

  const moved = chessInstance.move(moveInput)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  const capturedPieceSymbol = moved.captured
  const capturedColor = toOppositeColor(moved.color)
  const capturesNew = capturedPieceSymbol ? [...model.captures] : model.captures

  return Result.Ok({
    fen: chessInstance.fen(),
    captures: capturesNew,
  })
}
