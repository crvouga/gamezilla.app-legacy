import * as ChessJS from "chess.js"
import { Err, IO, Ok, Result, exhaustive } from "gamezilla-app/@SHARED/core"

import {
  IconBotCute,
  IconBotLevel1,
  IconBotLevel4,
  IconBotScary,
  IconBotSimple,
} from "gamezilla-app/app/spaces/@CHILD/game/@SHARED/vs-bot"
import { VDom } from "gamezilla-app/@SHARED/vdom"

export type BotLevel = 0 | 1 | 2 | 3 | 4

export const allBotLevels: BotLevel[] = [0, 1, 2, 3, 4]

export const botLevelToString = (level: BotLevel): string => {
  switch (level) {
    case 0: {
      return "Monkey"
      // return "Level 0";
    }
    case 1: {
      return "Beginner"
      // return "Level 1";
    }
    case 2: {
      return "Intermediate"
      // return "Level 2";
    }
    case 3: {
      return "Advanced"
      // return "Level 3";
    }
    case 4: {
      return "Experienced"
      // return "Level 4";
    }
  }
}

export const renderBotLevel = ({
  level,
  ...props
}: {
  level: BotLevel
  className?: string
}): VDom => {
  switch (level) {
    case 0: {
      return <IconBotSimple {...props} />
    }
    case 1: {
      return <IconBotCute {...props} />
    }
    case 2: {
      return <IconBotLevel1 {...props} />
    }
    case 3: {
      return <IconBotLevel4 {...props} />
    }
    case 4: {
      return <IconBotScary {...props} />
    }
  }
}

export type BestMoveInputResult = Result<BestMoveInputProblem, MoveInput>
export type BestMoveInputProblem = "failed_to_calculate_best_move"

const isRecord = (record: unknown): record is Record<string, string> => {
  // todo: add correct validation
  // expected { "some position": "some other position" }
  return typeof record === "object" && record !== null
}

export const toBestMoveInput = (
  level: BotLevel,
  model: Model,
): BestMoveInputResult => {
  const fen = toFen(model)

  const move: unknown = {
    fen,
    level,
  }

  if (!isRecord(move)) {
    return Err("failed_to_calculate_best_move")
  }

  const bestMoveInput = Object.entries(move).flatMap<MoveInput>(([from, to]) =>
    isSquare(from) && isSquare(to) ? [{ from, to, promotion: "q" }] : [],
  )[0]

  if (bestMoveInput) {
    return Ok(bestMoveInput)
  }

  return Err("failed_to_calculate_best_move")
}

export const toRandomMoveInput = (
  model: Model,
): Result<"no_legal_move", MoveInput> => {
  const legalMoveInputs = toLegalMoveInputs(model)

  const randomMoveInput =
    legalMoveInputs[Math.floor(Math.random() * legalMoveInputs.length)]

  if (!randomMoveInput) {
    return Err("no_legal_move")
  }

  return Ok(randomMoveInput)
}

export const getBestMove =
  (level: BotLevel, model: Model): IO<BestMoveInputResult> =>
  async () => {
    // TODO get this working off main thread
    // TODO: should not be hardcoded
    // const path = `${process.cwd()}/libs/game/chess/src/board-worker.ts`;

    // const worker = new Worker(path);

    // const boardWorker = await spawn<BoardWorker>(worker);

    // const result = await boardWorker.toBestMove(level, model);

    // await Thread.terminate(boardWorker);

    const result = toBestMoveInput(level, model)

    return result
  }

//
//
//
// Model
//
//
//

export type Model = {
  pgn: string
  fen: string
  previousMove?: MoveInput
}

export type File = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"

const files: { [file in File]: File } = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
}

export const FILE_ORDER: File[] = ["A", "B", "C", "D", "E", "F", "G", "H"]

export const isFile = (file: unknown): file is File => {
  return typeof file === "string" && file in files
}

export const isLowercaseFile = (file: unknown): file is Lowercase<File> => {
  return (
    typeof file === "string" &&
    isFile(file.toUpperCase()) &&
    file === file.toLowerCase()
  )
}

export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"

const ranks: { [rank in Rank]: Rank } = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
}

export const RANK_ORDER: Rank[] = ["8", "7", "6", "5", "4", "3", "2", "1"]

export const isRank = (rank: unknown): rank is Rank => {
  return typeof rank === "string" && rank in ranks
}

export const toSquare = (file: File, rank: Rank): Square => {
  return `${file}${rank}`
}

export const sanToSquare = (san: string): Square => {
  const squareRegex = /[A-Ha-h][1-8]/
  const match = san.match(squareRegex)
  if (match) {
    const square = match[0].toUpperCase()
    const file = square[0] as File
    const rank = square[1] as Rank

    if (isFile(file) && isRank(rank)) {
      return toSquare(file, rank)
    }
  }

  throw new Error("Invalid SAN notation")
}

const fromSquare = (square: Square): [File, Rank] => {
  const file = square[0]
  const rank = square[1]
  if (isFile(file) && isRank(rank)) {
    return [file, rank]
  }

  throw new Error("impossible condition")
}

export type Square = `${File}${Rank}`

export type LowercaseSquare = `${Lowercase<File>}${Rank}`

export const isLowercaseSquare = (
  square: unknown,
): square is LowercaseSquare => {
  return (
    typeof square === "string" &&
    isLowercaseFile(square[0]) &&
    isRank(square[1])
  )
}

export type Position = { x: number; y: number }

export const positionToSquare = (
  position: Position,
  orientation: Color,
): Square | null => {
  const { x, y } = position

  const rank =
    orientation === "w" ? RANK_ORDER[y] : RANK_ORDER[RANK_ORDER.length - 1 - y]

  const file =
    orientation === "w" ? FILE_ORDER[x] : FILE_ORDER[FILE_ORDER.length - 1 - x]

  if (isFile(file) && isRank(rank)) {
    return toSquare(file, rank)
  }

  return null
}

export const squareToChecker = (square: Square): "Light" | "Dark" => {
  const [file, rank] = fromSquare(square)

  const isOddFile =
    file === "A" ||
    // || file === 'B'
    file === "C" ||
    // || file === 'D'
    file === "E" ||
    // || file === 'F'
    file === "G"
  // || file === 'H'

  const isOddRank =
    rank === "1" ||
    // || rank === '2'
    rank === "3" ||
    // || rank === '4'
    rank === "5" ||
    // || rank === '6'
    rank === "7"
  // || rank === '8'

  if ((isOddFile && isOddRank) || (!isOddFile && !isOddRank)) {
    return "Dark"
  }

  return "Light"
}

export const fromLowercase = (square: LowercaseSquare): Square => {
  switch (square) {
    //
    case "a1":
      return "A1"
    case "a2":
      return "A2"
    case "a3":
      return "A3"
    case "a4":
      return "A4"
    case "a5":
      return "A5"
    case "a6":
      return "A6"
    case "a7":
      return "A7"
    case "a8":
      return "A8"
    //
    case "b1":
      return "B1"
    case "b2":
      return "B2"
    case "b3":
      return "B3"
    case "b4":
      return "B4"
    case "b5":
      return "B5"
    case "b6":
      return "B6"
    case "b7":
      return "B7"
    case "b8":
      return "B8"
    //
    case "c1":
      return "C1"
    case "c2":
      return "C2"
    case "c3":
      return "C3"
    case "c4":
      return "C4"
    case "c5":
      return "C5"
    case "c6":
      return "C6"
    case "c7":
      return "C7"
    case "c8":
      return "C8"
    //
    case "d1":
      return "D1"
    case "d2":
      return "D2"
    case "d3":
      return "D3"
    case "d4":
      return "D4"
    case "d5":
      return "D5"
    case "d6":
      return "D6"
    case "d7":
      return "D7"
    case "d8":
      return "D8"
    //
    case "e1":
      return "E1"
    case "e2":
      return "E2"
    case "e3":
      return "E3"
    case "e4":
      return "E4"
    case "e5":
      return "E5"
    case "e6":
      return "E6"
    case "e7":
      return "E7"
    case "e8":
      return "E8"
    //
    case "f1":
      return "F1"
    case "f2":
      return "F2"
    case "f3":
      return "F3"
    case "f4":
      return "F4"
    case "f5":
      return "F5"
    case "f6":
      return "F6"
    case "f7":
      return "F7"
    case "f8":
      return "F8"
    //
    case "g1":
      return "G1"
    case "g2":
      return "G2"
    case "g3":
      return "G3"
    case "g4":
      return "G4"
    case "g5":
      return "G5"
    case "g6":
      return "G6"
    case "g7":
      return "G7"
    case "g8":
      return "G8"
    //
    case "h1":
      return "H1"
    case "h2":
      return "H2"
    case "h3":
      return "H3"
    case "h4":
      return "H4"
    case "h5":
      return "H5"
    case "h6":
      return "H6"
    case "h7":
      return "H7"
    case "h8":
      return "H8"
  }
}

export const toLowercaseSquare = (square: Square): LowercaseSquare => {
  const lowered = square.toLowerCase()
  if (!isLowercaseSquare(lowered)) {
    throw new Error("impossible condition!")
  }
  return lowered
}

export const toUppercaseSquare = (square: LowercaseSquare): Square => {
  const upper = square.toUpperCase()
  if (!isSquare(upper)) {
    throw new Error("impossible condition!")
  }
  return upper
}

export const isSquare = (square: unknown): square is Square => {
  return typeof square === "string" && isFile(square[0]) && isRank(square[1])
}

export type PieceType = "P" | "B" | "N" | "R" | "Q" | "K"

export type Color = "w" | "b"

export type Piece = `${Color}${PieceType}`

export const pieceTypes: { [pieceType in PieceType]: PieceType } = {
  P: "P",
  B: "B",
  N: "N",
  R: "R",
  Q: "Q",
  K: "K",
}
export const colors: { [color in Color]: Color } = {
  b: "b",
  w: "w",
}

export const isColor = (color: unknown): color is Color => {
  return typeof color === "string" && ["w", "b"].includes(color)
}

export const isPiece = (piece: unknown): piece is Piece => {
  return Boolean(
    typeof piece === "string" &&
      piece[0] &&
      piece[1] &&
      isColor(piece[0]) &&
      isPieceType(piece[1]),
  )
}

export const pieces: Piece[] = []
for (const pieceType in pieceTypes) {
  for (const color in colors) {
    const piece = `${color}${pieceType}`
    if (isPiece(piece)) {
      pieces.push(piece)
    }
  }
}

export type PieceSymbol = "p" | "b" | "n" | "r" | "q" | "k"

const isPieceType = (char: string): char is PieceType => {
  return ["P", "B", "N", "R", "Q", "K"].includes(char)
}
export const fenToPieces = (
  fen: string,
  orientation: "w" | "b",
): {
  x: number
  y: number
  piece: Piece
}[] => {
  const parts = fen.split(" ")
  const rowsString = parts[0]
  if (!rowsString) return []

  const rows = rowsString.split("/")
  const grid: { x: number; y: number; piece: Piece }[] = []

  const size = 7 // Assuming an 8x8 board

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    let length = 0
    if (!row) {
      continue
    }
    for (let i = 0; i < row.length; i++) {
      const char = row.charAt(i)

      if (isNaN(Number(char))) {
        const color = char === char.toLowerCase() ? "b" : "w"
        const pieceType = char.toUpperCase()

        const x = orientation === "w" ? length : size - length
        const yCoord = orientation === "w" ? y : size - y

        if (isPieceType(pieceType)) {
          grid.push({
            x: x,
            y: yCoord,
            piece: `${color}${pieceType}`,
          })
        }
      } else {
        const spaces = Number(char)
        length += spaces - 1
      }
      length++
    }
  }

  return grid
}
const allPieceSymbols: { [pieceSymbol in PieceSymbol]: PieceSymbol } = {
  b: "b",
  k: "k",
  n: "n",
  p: "p",
  q: "q",
  r: "r",
}

export const isPieceSymbol = (
  pieceSymbol: unknown,
): pieceSymbol is PieceSymbol => {
  return (
    typeof pieceSymbol === "string" &&
    Object.keys(allPieceSymbols).includes(pieceSymbol)
  )
}

export type PromotionPieceSymbol = "b" | "n" | "r" | "q"

const allPromotionPieceSymbols: {
  [promotionPieceSymbol in PromotionPieceSymbol]: PromotionPieceSymbol
} = {
  b: "b",
  n: "n",
  q: "q",
  r: "r",
}

export const isPromotionPieceSymbol = (
  pieceSymbol: unknown,
): pieceSymbol is PromotionPieceSymbol => {
  return (
    typeof pieceSymbol === "string" &&
    Object.keys(allPromotionPieceSymbols).includes(pieceSymbol)
  )
}

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
  const chessInstance = new ChessJS.Chess()

  return {
    fen: chessInstance.fen(),
    pgn: chessInstance.pgn(),
  }
}

export const initFromFen = ({ fen }: { fen: string }): Model => {
  const chessInstance = new ChessJS.Chess()

  chessInstance.load(fen)

  return {
    fen: chessInstance.fen(),
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

export const createInstance = (model: Model) => {
  const instance = new ChessJS.Chess()
  instance.load(model.fen)
  return instance
}

export const toFen = (model: Model): string => {
  return model.fen
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
  return createInstance(model).inCheck()
}

export const inDraw = (model: Model): boolean => {
  return createInstance(model).isDraw()
}

export const inCheckmate = (model: Model): boolean => {
  return createInstance(model).isCheckmate()
}

export const inStalemate = (model: Model): boolean => {
  return createInstance(model).isStalemate()
}

export const insufficientMaterial = (model: Model): boolean => {
  return createInstance(model).isInsufficientMaterial()
}

export const inThreefoldRepetition = (model: Model): boolean => {
  return createInstance(model).isThreefoldRepetition()
}

export const toMissingPieces = (model: Model) => {
  const instance = createInstance(model)
  return instance.history()
}

export const toTurn = (model: Model): Color => {
  const instance = createInstance(model)
  return instance.turn()
}

export type GameOver =
  | {
      type: "Checkmate"
      winner: Color
    }
  | {
      type: "Stalemate"
    }

export const toGameOver = (model: Model): GameOver | { type: "none" } => {
  if (inCheckmate(model)) {
    return {
      type: "Checkmate",
      winner: toOppositeColor(toTurn(model)),
    }
  }

  if (inStalemate(model)) {
    return {
      type: "Stalemate",
    }
  }

  return {
    type: "none",
  }
}

//
//
//
// Move
//
//
//

export type MoveInput = {
  from: Square
  to: Square
  promotion: PromotionPieceSymbol
}

export type MoveProblem = "invalid_move"

export const move = (
  moveInput: MoveInput,
  model: Model,
): Result<MoveProblem, Model & { didCapture: boolean }> => {
  const instance = createInstance(model)

  const moveInput_ = {
    from: toLowercaseSquare(moveInput.from),
    to: toLowercaseSquare(moveInput.to),
    promotion: moveInput.promotion,
  }

  try {
    const moved = instance.move(moveInput_)

    if (!moved) {
      return Err("invalid_move")
    }

    // const capturesNew = capturedPieceSymbol ? [...model.captures] : model.captures

    return Ok({
      pgn: instance.pgn(),
      fen: instance.fen(),
      previousMove: moveInput,
      didCapture: Boolean(moved.captured),
    })
  } catch (error) {
    return Err("invalid_move")
  }
}

export const moveMany = (moveInputs: MoveInput[], model: Model) => {
  return moveInputs.reduce<
    Result<MoveProblem, Model & { didCapture: boolean }>
  >((acc, moveInput) => {
    if (acc.t === "err") {
      return acc
    }
    const moved = move(moveInput, acc.value)
    if (moved.t === "err") {
      return moved
    }
    return Ok(moved.value)
  }, Ok({ ...model, didCapture: false }))
}

export const toLegalMoveInputs = (model: Model): MoveInput[] => {
  const instance = createInstance(model)
  const moves = instance.moves({ verbose: true })
  return moves.flatMap(chessTsMoveToMove)
}

export const chessTsMoveToMove = (move: ChessJS.Move): MoveInput[] => {
  if (isLowercaseSquare(move.from) && isLowercaseSquare(move.to)) {
    const promotion: PromotionPieceSymbol = isPromotionPieceSymbol(
      move.promotion,
    )
      ? move.promotion
      : "q"
    return [
      {
        from: fromLowercase(move.from),
        to: fromLowercase(move.to),
        promotion,
      },
    ]
  }

  return []
}

export const uciMoveToMoveInput = (
  uciMove: string,
): Result<string, MoveInput> => {
  const uciMoveRegex = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/
  const match = uciMove.match(uciMoveRegex)

  if (!match) {
    return Err(
      `uci move did not match regex. uciMove: ${uciMove} regex: ${uciMoveRegex}`,
    )
  }

  const [, from, to, promotion] = match

  if (!(from && to)) {
    return Err("failed to extract from and to from uci move")
  }

  const upperCaseFrom = from.toUpperCase()
  const upperCaseTo = to.toUpperCase()

  if (!(isSquare(upperCaseFrom) && isSquare(upperCaseTo))) {
    return Err("from or to is not a valid square")
  }

  const promotionPiece: PromotionPieceSymbol = isPromotionPieceSymbol(promotion)
    ? promotion
    : "q"

  return Ok({
    from: upperCaseFrom,
    to: upperCaseTo,
    promotion: promotionPiece,
  })
}

export const isMoveEqual = (a: MoveInput, b: MoveInput): boolean => {
  return a.from === b.from && a.to === b.to
}
