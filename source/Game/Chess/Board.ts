import * as ChessTs from "chess.ts"
import { exhaustive, Result } from "../../Core"

//
//
//
// Model
//
//
//

export type Model = {
  pgn: string
}

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

export const toPieceType = (piece: Piece): PieceType => {
  switch (piece) {
    case "bB":
    case "wB":
      return "B"
    case "bK":
    case "wK":
      return "K"
    case "bN":
    case "wN":
      return "N"
    case "bP":
    case "wP":
      return "P"
    case "bQ":
    case "wQ":
      return "Q"
    case "bR":
    case "wR":
      return "R"

    default:
      return exhaustive(piece)
  }
}

export const init = (): Model => {
  const chessInstance = new ChessTs.Chess()

  return {
    pgn: chessInstance.pgn(),
  }
}

//
//
//
//
//
//
//

const _createInstance = (model: Model) => {
  const instance = new ChessTs.Chess()

  instance.loadPgn(model.pgn)

  return instance
}

export const toFen = (model: Model): string => {
  const instance = _createInstance(model)

  return instance.fen()
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

export const toOppositeColor = (color: Color): Color => {
  switch (color) {
    case "b":
      return "w"

    case "w":
      return "b"
  }
}

export const inCheck = (model: Model): boolean => {
  return _createInstance(model).inCheck()
}

export const inDraw = (model: Model): boolean => {
  return _createInstance(model).inDraw()
}

export const inCheckmate = (model: Model): boolean => {
  return _createInstance(model).inCheckmate()
}

export const inStalemate = (model: Model): boolean => {
  return _createInstance(model).inStalemate()
}

export const insufficientMaterial = (model: Model): boolean => {
  return _createInstance(model).insufficientMaterial()
}

export const inThreefoldRepetition = (model: Model): boolean => {
  return _createInstance(model).inThreefoldRepetition()
}

export const toMissingPieces = (model: Model) => {
  const instance = _createInstance(model)
  return instance.history()
}

export const toTurn = (model: Model): Color => {
  const instance = _createInstance(model)

  return instance.turn()
}

//
//
//
// Move
//
//
//

export type MoveInput = ChessTs.PartialMove

export type MoveProblem = "invalid_move"

export const move = (
  moveInput: MoveInput,
  model: Model,
): Result.Result<MoveProblem, Model & { didCapture: boolean }> => {
  const instance = _createInstance(model)

  const moved = instance.move(moveInput)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  // const capturesNew = capturedPieceSymbol ? [...model.captures] : model.captures

  return Result.Ok({
    pgn: instance.pgn(),
    didCapture: Boolean(moved.captured),
  })
}
