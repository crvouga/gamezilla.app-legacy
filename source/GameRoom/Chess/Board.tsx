import * as ChessTs from "chess.ts"
// @ts-ignore
import { aiMove } from "js-chess-engine"
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Chessboard, CustomSquareStyles } from "react-chessboard"
import { spawn, Thread, Worker } from "threads"
import { exhaustive, Result, Task } from "../../Core"
import { BoardWorker } from "./board-worker"

export type Level = 0 | 1 | 2 | 3 | 4

export const allLevels: Level[] = [0, 1, 2, 3, 4]

export const levelToString = (level: Level): string => {
  switch (level) {
    case 0: {
      return "Monkey"
    }
    case 1: {
      return "Beginner"
    }
    case 2: {
      return "Intermediate"
    }
    case 3: {
      return "Advanced"
    }
    case 4: {
      return "Experienced"
    }
  }
}


export type BestMoveInputResult = Result.Result<BestMoveInputProblem, MoveInput>
export type BestMoveInputProblem = "failed_to_calculate_best_move"

const isRecord = (record: unknown): record is Record<string, string> => {
  // todo: add correct validation
  return typeof record === 'object' && record !== null
}

export const toBestMoveInput = (level: Level, model: Model): BestMoveInputResult => {
  const fen = toFen(model)

  console.log("toBestMove")
  console.log(fen)

  const move: unknown = aiMove(fen, level)

  if (!isRecord(move)) {
    return Result.Err("failed_to_calculate_best_move")
  }

  const bestMoveInput = Object.entries(move)
    .flatMap<MoveInput>(([from, to]) => isSquare(from) && isSquare(to) ? [{ from, to, promotion: "q" }] : [])[0]

  if (bestMoveInput) {
    return Result.Ok(bestMoveInput)
  }

  return Result.Err("failed_to_calculate_best_move")
}


export const toRandomMoveInput = (model: Model): Result.Result<"no_legal_move", MoveInput> => {
  const legalMoveInputs = toLegalMoveInputs(model)

  const randomMoveInput = legalMoveInputs[Math.floor(Math.random() * legalMoveInputs.length)]

  if (!randomMoveInput) {
    return Result.Err("no_legal_move")
  }

  return Result.Ok(randomMoveInput)
}

export const getBestMove = (level: Level, model: Model): Task.Task<BestMoveInputResult> => async () => {
  const worker = new Worker("./board-worker")

  const boardWorker = await spawn<BoardWorker>(worker)

  const result =
    await boardWorker.toBestMove(level, model)

  await Thread.terminate(boardWorker)

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
  H: "H"
}

export const isFile = (file: unknown): file is File => {
  return typeof file === 'string' && file in files
}

export const isLowercaseFile = (file: unknown): file is Lowercase<File> => {
  return typeof file === 'string' && isFile(file.toUpperCase()) && file === file.toLowerCase()
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

export const isRank = (rank: unknown): rank is Rank => {
  return typeof rank === 'string' && rank in ranks
}

export const toSquare = (file: File, rank: Rank): Square => {
  return `${file}${rank}`
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

export const isLowercaseSquare = (square: unknown): square is LowercaseSquare => {
  return typeof square === 'string' && isLowercaseFile(square[0]) && isRank(square[1])
}


export const squareToChecker = (square: Square): "Light" | "Dark" => {
  const [file, rank] = fromSquare(square)

  const isOddFile =
    file === 'A'
    // || file === 'B'
    || file === 'C'
    // || file === 'D'
    || file === 'E'
    // || file === 'F'
    || file === 'G'
  // || file === 'H'

  const isOddRank =
    rank === '1'
    // || rank === '2'
    || rank === '3'
    // || rank === '4'
    || rank === '5'
    // || rank === '6'
    || rank === '7'
  // || rank === '8'

  if ((isOddFile && isOddRank) || (!isOddFile && !isOddRank)) {
    return "Dark"
  }

  return "Light"
}


export const fromLowercase = (square: LowercaseSquare): Square => {
  switch (square) {
    // 
    case 'a1': return 'A1'
    case 'a2': return 'A2'
    case 'a3': return 'A3'
    case 'a4': return 'A4'
    case 'a5': return 'A5'
    case 'a6': return 'A6'
    case 'a7': return 'A7'
    case 'a8': return 'A8'
    // 
    case 'b1': return 'B1'
    case 'b2': return 'B2'
    case 'b3': return 'B3'
    case 'b4': return 'B4'
    case 'b5': return 'B5'
    case 'b6': return 'B6'
    case 'b7': return 'B7'
    case 'b8': return 'B8'
    // 
    case 'c1': return 'C1'
    case 'c2': return 'C2'
    case 'c3': return 'C3'
    case 'c4': return 'C4'
    case 'c5': return 'C5'
    case 'c6': return 'C6'
    case 'c7': return 'C7'
    case 'c8': return 'C8'
    // 
    case 'd1': return 'D1'
    case 'd2': return 'D2'
    case 'd3': return 'D3'
    case 'd4': return 'D4'
    case 'd5': return 'D5'
    case 'd6': return 'D6'
    case 'd7': return 'D7'
    case 'd8': return 'D8'
    // 
    case 'e1': return 'E1'
    case 'e2': return 'E2'
    case 'e3': return 'E3'
    case 'e4': return 'E4'
    case 'e5': return 'E5'
    case 'e6': return 'E6'
    case 'e7': return 'E7'
    case 'e8': return 'E8'
    // 
    case 'f1': return 'F1'
    case 'f2': return 'F2'
    case 'f3': return 'F3'
    case 'f4': return 'F4'
    case 'f5': return 'F5'
    case 'f6': return 'F6'
    case 'f7': return 'F7'
    case 'f8': return 'F8'
    //
    case 'g1': return 'G1'
    case 'g2': return 'G2'
    case 'g3': return 'G3'
    case 'g4': return 'G4'
    case 'g5': return 'G5'
    case 'g6': return 'G6'
    case 'g7': return 'G7'
    case 'g8': return 'G8'
    //
    case 'h1': return 'H1'
    case 'h2': return 'H2'
    case 'h3': return 'H3'
    case 'h4': return 'H4'
    case 'h5': return 'H5'
    case 'h6': return 'H6'
    case 'h7': return 'H7'
    case 'h8': return 'H8'
  }
}

export const toLowercaseSquare = (square: Square): LowercaseSquare => {
  switch (square) {
    case 'A1': return 'a1'
    case 'A2': return 'a2'
    case 'A3': return 'a3'
    case 'A4': return 'a4'
    case 'A5': return 'a5'
    case 'A6': return 'a6'
    case 'A7': return 'a7'
    case 'A8': return 'a8'
    case 'B1': return 'b1'
    case 'B2': return 'b2'
    case 'B3': return 'b3'
    case 'B4': return 'b4'
    case 'B5': return 'b5'
    case 'B6': return 'b6'
    case 'B7': return 'b7'
    case 'B8': return 'b8'
    case 'C1': return 'c1'
    case 'C2': return 'c2'
    case 'C3': return 'c3'
    case 'C4': return 'c4'
    case 'C5': return 'c5'
    case 'C6': return 'c6'
    case 'C7': return 'c7'
    case 'C8': return 'c8'
    case 'D1': return 'd1'
    case 'D2': return 'd2'
    case 'D3': return 'd3'
    case 'D4': return 'd4'
    case 'D5': return 'd5'
    case 'D6': return 'd6'
    case 'D7': return 'd7'
    case 'D8': return 'd8'
    case 'E1': return 'e1'
    case 'E2': return 'e2'
    case 'E3': return 'e3'
    case 'E4': return 'e4'
    case 'E5': return 'e5'
    case 'E6': return 'e6'
    case 'E7': return 'e7'
    case 'E8': return 'e8'
    case 'F1': return 'f1'
    case 'F2': return 'f2'
    case 'F3': return 'f3'
    case 'F4': return 'f4'
    case 'F5': return 'f5'
    case 'F6': return 'f6'
    case 'F7': return 'f7'
    case 'F8': return 'f8'
    case 'G1': return 'g1'
    case 'G2': return 'g2'
    case 'G3': return 'g3'
    case 'G4': return 'g4'
    case 'G5': return 'g5'
    case 'G6': return 'g6'
    case 'G7': return 'g7'
    case 'G8': return 'g8'
    case 'H1': return 'h1'
    case 'H2': return 'h2'
    case 'H3': return 'h3'
    case 'H4': return 'h4'
    case 'H5': return 'h5'
    case 'H6': return 'h6'
    case 'H7': return 'h7'
    case 'H8': return 'h8'
  }
}

export const isSquare = (square: unknown): square is Square => {
  return typeof square === 'string' && isFile(square[0]) && isRank(square[1])
}

export type PieceType = "P" | "B" | "N" | "R" | "Q" | "K"

export type PieceSymbol = "p" | "b" | "n" | "r" | "q" | "k"

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


// todo use LRU cache instead
const cache = new Map<string, ChessTs.Chess>();

const createInstance = (model: Model, { source }: { source: 'Cache' | "New" } = { source: 'Cache' }) => {
  const cached = cache.get(model.pgn)

  if (cached && source === 'Cache') {
    console.log("cached.")
    return cached
  }


  const instance = new ChessTs.Chess()

  instance.loadPgn(model.pgn)

  cache.set(model.pgn, instance)
  console.log("New!")

  return instance
}

export const toFen = (model: Model): string => {
  const instance = createInstance(model)

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
  return createInstance(model).inCheck()
}

export const inDraw = (model: Model): boolean => {
  return createInstance(model).inDraw()
}

export const inCheckmate = (model: Model): boolean => {
  return createInstance(model).inCheckmate()
}

export const inStalemate = (model: Model): boolean => {
  return createInstance(model).inStalemate()
}

export const insufficientMaterial = (model: Model): boolean => {
  return createInstance(model).insufficientMaterial()
}

export const inThreefoldRepetition = (model: Model): boolean => {
  return createInstance(model).inThreefoldRepetition()
}

export const toMissingPieces = (model: Model) => {
  const instance = createInstance(model)
  return instance.history()
}

export const toTurn = (model: Model): Color => {
  const instance = createInstance(model, { source: "New" })
  return instance.turn()
}

export type GameOver = {
  type: "Checkmate",
  winner: Color
} | {
  type: "Stalemate",
}

export const toGameOver = (model: Model): GameOver | { type: "None" } => {
  if (inCheckmate(model)) {
    return {
      type: "Checkmate",
      winner: toOppositeColor(toTurn(model))
    }
  }


  if (inStalemate(model)) {
    return {
      type: "Stalemate"
    }
  }

  return {
    type: "None"
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
  from: Square,
  to: Square,
  promotion: PieceSymbol
}

export type MoveProblem = "invalid_move"

export const move = (
  moveInput: MoveInput,
  model: Model,
): Result.Result<MoveProblem, Model & { didCapture: boolean }> => {
  const instance = createInstance(model)

  const moveInput_ = {
    from: toLowercaseSquare(moveInput.from),
    to: toLowercaseSquare(moveInput.to),
    promotion: moveInput.promotion
  }

  const moved = instance.move(moveInput_)

  if (!moved) {
    return Result.Err("invalid_move")
  }

  // const capturesNew = capturedPieceSymbol ? [...model.captures] : model.captures

  return Result.Ok({
    pgn: instance.pgn(),
    didCapture: Boolean(moved.captured),
  })
}

export const toPreviousMoves = (model: Model): MoveInput[] => {
  const instance = createInstance(model)
  const moves = instance.history({ verbose: true })
  return moves.flatMap(chessTsMoveToMove)
}

export const toLegalMoveInputs = (model: Model): MoveInput[] => {
  const instance = createInstance(model)
  const moves = instance.moves({ verbose: true })
  return moves.flatMap(chessTsMoveToMove)
}

export const chessTsMoveToMove = (move: ChessTs.Move): MoveInput[] => {
  if (isLowercaseSquare(move.from) && isLowercaseSquare(move.to)) {
    return [{
      from: fromLowercase(move.from),
      to: fromLowercase(move.to),
      promotion: move.promotion ?? "q",
    }]
  }

  return []
}

//
//
//
//
// View
//
//
//

export const theme = {
  dark: "#779455",
  light: "#EBEBD0",
  highlighted: {
    dark: "#BDCB3F",
    light: "#F6F686"
  }
}

export const View = ({
  boardOrientation,
  model,
  onPieceDrop,
  isDraggablePiece,
}: {
  boardOrientation: Color
  model: Model
  onPieceDrop: (move: MoveInput) => boolean
  isDraggablePiece: ({ piece }: { piece: Piece }) => boolean
}) => {
  const [boardWidth, setBoardWidth] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const handler = () => {
      if (ref.current) {
        setBoardWidth(ref.current?.offsetWidth)
      }
    }

    handler()

    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])

  const previousMoves = useMemo(() => toPreviousMoves(model), [model])
  const latestMove = previousMoves[previousMoves.length - 1]

  const lastMoveStyles: CustomSquareStyles = latestMove ?
    {
      [toLowercaseSquare(latestMove.to)]: {
        background: 'rgba(255, 255, 0, 0.4)'
      },

      [toLowercaseSquare(latestMove.from)]: {
        background: 'rgba(255, 255, 0, 0.4)'
      }
    }
    : {
    }

  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)

  const legalMoves = useMemo(() => toLegalMoveInputs(model).filter(move => selectedSquare === move.from), [model.pgn.length, selectedSquare])

  const legalMovesStyles = legalMoves.reduce<CustomSquareStyles>((styles, move) => ({
    ...styles,
    [toLowercaseSquare(move.to)]: {
      background: 'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
      borderRadius: '50%',
      cursor: "pointer"
    }
  }),
    selectedSquare ? {
      [toLowercaseSquare(selectedSquare)]: {
        background: 'rgba(255, 255, 0, 0.4)'
      }
    } :
      {}
  )

  useEffect(() => {
    setHoveredSquare(null)
    setSelectedSquare(null)
  }, [model.pgn.length])


  return (
    <div ref={ref}>
      <Chessboard
        showBoardNotation
        snapToCursor
        boardOrientation={boardOrientation === "w" ? "white" : "black"}
        position={toFen(model)}
        boardWidth={boardWidth}
        customDarkSquareStyle={{
          backgroundColor: theme.dark,
        }}
        customLightSquareStyle={{
          backgroundColor: theme.light
        }}
        onSquareClick={(to) => {
          if (selectedSquare) {
            const moveInput: MoveInput = {
              from: selectedSquare,
              to: fromLowercase(to),
              promotion: "q",
            }

            onPieceDrop(moveInput)
          }
        }}
        onMouseOverSquare={(square) => {
          setHoveredSquare(fromLowercase(square))
        }}
        onPieceDragBegin={(_piece, sourceSquare) => {
          setSelectedSquare(fromLowercase(sourceSquare))
        }}
        onPieceClick={(piece) => {
          setSelectedSquare(hoveredSquare)
        }}
        customSquareStyles={{
          ...lastMoveStyles,
          ...legalMovesStyles
        }}
        customPieces={customPieces()}
        isDraggablePiece={({ piece, }) => {
          return isDraggablePiece({ piece })
        }}
        onPieceDrop={(from, to, _piece) => {
          const moveInput: MoveInput = {
            from: fromLowercase(from),
            to: fromLowercase(to),
            promotion: "q",
          }

          return onPieceDrop(moveInput)
        }}
      />
    </div>
  )
}

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = () => {
  const returnPieces: { [piece: string]: ({ squareWidth }: { squareWidth: number }) => ReactNode } = {};

  pieces.map((p) => {
    returnPieces[p] = ({ squareWidth }) => (
      <div
        style={{
          width: squareWidth,
          height: squareWidth,
          backgroundImage: `url(/media/${p}.png)`,
          backgroundSize: '100%',
        }}
      />
    );
    return null;
  });
  return returnPieces;
};
