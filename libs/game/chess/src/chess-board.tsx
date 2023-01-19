import { exhaustive, Result, Task } from '@gamezilla/core';
import * as ChessTs from 'chess.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { aiMove } from 'js-chess-engine';
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Chessboard, CustomSquareStyles } from 'react-chessboard';

export type BotLevel = 0 | 1 | 2 | 3 | 4;

export const allBotLevels: BotLevel[] = [0, 1, 2, 3, 4];

export const botLevelToString = (level: BotLevel): string => {
  switch (level) {
    case 0: {
      // return "Monkey"
      return 'Level 0';
    }
    case 1: {
      // return "Beginner"
      return 'Level 1';
    }
    case 2: {
      // return "Intermediate"
      return 'Level 2';
    }
    case 3: {
      // return "Advanced"
      return 'Level 3';
    }
    case 4: {
      // return "Experienced"
      return 'Level 4';
    }
  }
};

export type BestMoveInputResult = Result<BestMoveInputProblem, MoveInput>;
export type BestMoveInputProblem = 'failed_to_calculate_best_move';

const isRecord = (record: unknown): record is Record<string, string> => {
  // todo: add correct validation
  // expected { "some position": "some other position" }
  return typeof record === 'object' && record !== null;
};

export const toBestMoveInput = (
  level: BotLevel,
  model: Model
): BestMoveInputResult => {
  const fen = toFen(model);

  const move: unknown = aiMove(fen, level);

  if (!isRecord(move)) {
    return Result.Err('failed_to_calculate_best_move');
  }

  const bestMoveInput = Object.entries(move).flatMap<MoveInput>(([from, to]) =>
    isSquare(from) && isSquare(to) ? [{ from, to, promotion: 'q' }] : []
  )[0];

  if (bestMoveInput) {
    return Result.Ok(bestMoveInput);
  }

  return Result.Err('failed_to_calculate_best_move');
};

export const toRandomMoveInput = (
  model: Model
): Result<'no_legal_move', MoveInput> => {
  const legalMoveInputs = toLegalMoveInputs(model);

  const randomMoveInput =
    legalMoveInputs[Math.floor(Math.random() * legalMoveInputs.length)];

  if (!randomMoveInput) {
    return Result.Err('no_legal_move');
  }

  return Result.Ok(randomMoveInput);
};

export const getBestMove =
  (level: BotLevel, model: Model): Task<BestMoveInputResult> =>
  async () => {
    // TODO get this working off main thread
    // TODO: should not be hardcoded
    // const path = `${process.cwd()}/libs/game/chess/src/board-worker.ts`;

    // const worker = new Worker(path);

    // const boardWorker = await spawn<BoardWorker>(worker);

    // const result = await boardWorker.toBestMove(level, model);

    // await Thread.terminate(boardWorker);

    const result = toBestMoveInput(level, model);

    return result;
  };

//
//
//
// Model
//
//
//

export type Model = {
  pgn: string;
  fen: string;
  previousMove?: MoveInput;
};

export type File = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

const files: { [file in File]: File } = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  H: 'H',
};

export const isFile = (file: unknown): file is File => {
  return typeof file === 'string' && file in files;
};

export const isLowercaseFile = (file: unknown): file is Lowercase<File> => {
  return (
    typeof file === 'string' &&
    isFile(file.toUpperCase()) &&
    file === file.toLowerCase()
  );
};

export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

const ranks: { [rank in Rank]: Rank } = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
};

export const isRank = (rank: unknown): rank is Rank => {
  return typeof rank === 'string' && rank in ranks;
};

export const toSquare = (file: File, rank: Rank): Square => {
  return `${file}${rank}`;
};

const fromSquare = (square: Square): [File, Rank] => {
  const file = square[0];
  const rank = square[1];
  if (isFile(file) && isRank(rank)) {
    return [file, rank];
  }

  throw new Error('impossible condition');
};

export type Square = `${File}${Rank}`;

export type LowercaseSquare = `${Lowercase<File>}${Rank}`;

export const isLowercaseSquare = (
  square: unknown
): square is LowercaseSquare => {
  return (
    typeof square === 'string' &&
    isLowercaseFile(square[0]) &&
    isRank(square[1])
  );
};

export const squareToChecker = (square: Square): 'Light' | 'Dark' => {
  const [file, rank] = fromSquare(square);

  const isOddFile =
    file === 'A' ||
    // || file === 'B'
    file === 'C' ||
    // || file === 'D'
    file === 'E' ||
    // || file === 'F'
    file === 'G';
  // || file === 'H'

  const isOddRank =
    rank === '1' ||
    // || rank === '2'
    rank === '3' ||
    // || rank === '4'
    rank === '5' ||
    // || rank === '6'
    rank === '7';
  // || rank === '8'

  if ((isOddFile && isOddRank) || (!isOddFile && !isOddRank)) {
    return 'Dark';
  }

  return 'Light';
};

export const fromLowercase = (square: LowercaseSquare): Square => {
  switch (square) {
    //
    case 'a1':
      return 'A1';
    case 'a2':
      return 'A2';
    case 'a3':
      return 'A3';
    case 'a4':
      return 'A4';
    case 'a5':
      return 'A5';
    case 'a6':
      return 'A6';
    case 'a7':
      return 'A7';
    case 'a8':
      return 'A8';
    //
    case 'b1':
      return 'B1';
    case 'b2':
      return 'B2';
    case 'b3':
      return 'B3';
    case 'b4':
      return 'B4';
    case 'b5':
      return 'B5';
    case 'b6':
      return 'B6';
    case 'b7':
      return 'B7';
    case 'b8':
      return 'B8';
    //
    case 'c1':
      return 'C1';
    case 'c2':
      return 'C2';
    case 'c3':
      return 'C3';
    case 'c4':
      return 'C4';
    case 'c5':
      return 'C5';
    case 'c6':
      return 'C6';
    case 'c7':
      return 'C7';
    case 'c8':
      return 'C8';
    //
    case 'd1':
      return 'D1';
    case 'd2':
      return 'D2';
    case 'd3':
      return 'D3';
    case 'd4':
      return 'D4';
    case 'd5':
      return 'D5';
    case 'd6':
      return 'D6';
    case 'd7':
      return 'D7';
    case 'd8':
      return 'D8';
    //
    case 'e1':
      return 'E1';
    case 'e2':
      return 'E2';
    case 'e3':
      return 'E3';
    case 'e4':
      return 'E4';
    case 'e5':
      return 'E5';
    case 'e6':
      return 'E6';
    case 'e7':
      return 'E7';
    case 'e8':
      return 'E8';
    //
    case 'f1':
      return 'F1';
    case 'f2':
      return 'F2';
    case 'f3':
      return 'F3';
    case 'f4':
      return 'F4';
    case 'f5':
      return 'F5';
    case 'f6':
      return 'F6';
    case 'f7':
      return 'F7';
    case 'f8':
      return 'F8';
    //
    case 'g1':
      return 'G1';
    case 'g2':
      return 'G2';
    case 'g3':
      return 'G3';
    case 'g4':
      return 'G4';
    case 'g5':
      return 'G5';
    case 'g6':
      return 'G6';
    case 'g7':
      return 'G7';
    case 'g8':
      return 'G8';
    //
    case 'h1':
      return 'H1';
    case 'h2':
      return 'H2';
    case 'h3':
      return 'H3';
    case 'h4':
      return 'H4';
    case 'h5':
      return 'H5';
    case 'h6':
      return 'H6';
    case 'h7':
      return 'H7';
    case 'h8':
      return 'H8';
  }
};

export const toLowercaseSquare = (square: Square): LowercaseSquare => {
  switch (square) {
    case 'A1':
      return 'a1';
    case 'A2':
      return 'a2';
    case 'A3':
      return 'a3';
    case 'A4':
      return 'a4';
    case 'A5':
      return 'a5';
    case 'A6':
      return 'a6';
    case 'A7':
      return 'a7';
    case 'A8':
      return 'a8';
    case 'B1':
      return 'b1';
    case 'B2':
      return 'b2';
    case 'B3':
      return 'b3';
    case 'B4':
      return 'b4';
    case 'B5':
      return 'b5';
    case 'B6':
      return 'b6';
    case 'B7':
      return 'b7';
    case 'B8':
      return 'b8';
    case 'C1':
      return 'c1';
    case 'C2':
      return 'c2';
    case 'C3':
      return 'c3';
    case 'C4':
      return 'c4';
    case 'C5':
      return 'c5';
    case 'C6':
      return 'c6';
    case 'C7':
      return 'c7';
    case 'C8':
      return 'c8';
    case 'D1':
      return 'd1';
    case 'D2':
      return 'd2';
    case 'D3':
      return 'd3';
    case 'D4':
      return 'd4';
    case 'D5':
      return 'd5';
    case 'D6':
      return 'd6';
    case 'D7':
      return 'd7';
    case 'D8':
      return 'd8';
    case 'E1':
      return 'e1';
    case 'E2':
      return 'e2';
    case 'E3':
      return 'e3';
    case 'E4':
      return 'e4';
    case 'E5':
      return 'e5';
    case 'E6':
      return 'e6';
    case 'E7':
      return 'e7';
    case 'E8':
      return 'e8';
    case 'F1':
      return 'f1';
    case 'F2':
      return 'f2';
    case 'F3':
      return 'f3';
    case 'F4':
      return 'f4';
    case 'F5':
      return 'f5';
    case 'F6':
      return 'f6';
    case 'F7':
      return 'f7';
    case 'F8':
      return 'f8';
    case 'G1':
      return 'g1';
    case 'G2':
      return 'g2';
    case 'G3':
      return 'g3';
    case 'G4':
      return 'g4';
    case 'G5':
      return 'g5';
    case 'G6':
      return 'g6';
    case 'G7':
      return 'g7';
    case 'G8':
      return 'g8';
    case 'H1':
      return 'h1';
    case 'H2':
      return 'h2';
    case 'H3':
      return 'h3';
    case 'H4':
      return 'h4';
    case 'H5':
      return 'h5';
    case 'H6':
      return 'h6';
    case 'H7':
      return 'h7';
    case 'H8':
      return 'h8';
  }
};

export const isSquare = (square: unknown): square is Square => {
  return typeof square === 'string' && isFile(square[0]) && isRank(square[1]);
};

export type PieceType = 'P' | 'B' | 'N' | 'R' | 'Q' | 'K';

export type PieceSymbol = 'p' | 'b' | 'n' | 'r' | 'q' | 'k';

export type Color = 'w' | 'b';

export const colors: { [color in Color]: Color } = {
  b: 'b',
  w: 'w',
};

export type Piece = `${Color}${PieceType}`;

export const toColor = (piece: Piece): Color => {
  switch (piece) {
    case 'bB':
    case 'bK':
    case 'bN':
    case 'bP':
    case 'bQ':
    case 'bR':
      return 'b';

    case 'wB':
    case 'wK':
    case 'wN':
    case 'wP':
    case 'wQ':
    case 'wR':
      return 'w';

    default:
      return exhaustive(piece);
  }
};

export const toPieceType = (piece: Piece): PieceType => {
  switch (piece) {
    case 'bB':
    case 'wB':
      return 'B';
    case 'bK':
    case 'wK':
      return 'K';
    case 'bN':
    case 'wN':
      return 'N';
    case 'bP':
    case 'wP':
      return 'P';
    case 'bQ':
    case 'wQ':
      return 'Q';
    case 'bR':
    case 'wR':
      return 'R';

    default:
      return exhaustive(piece);
  }
};

export const init = (): Model => {
  const chessInstance = new ChessTs.Chess();

  return {
    fen: chessInstance.fen(),
    pgn: chessInstance.pgn(),
  };
};

//
//
//
//
//
//
//

const createInstance = (model: Model) => {
  const instance = new ChessTs.Chess();
  instance.load(model.fen);
  return instance;
};

export const toFen = (model: Model): string => {
  return model.fen;
};

export const colorToString = (color: Color): string => {
  switch (color) {
    case 'b': {
      return 'Black';
    }

    case 'w': {
      return 'White';
    }
  }
};

export const toOppositeColor = (color: Color): Color => {
  switch (color) {
    case 'b':
      return 'w';

    case 'w':
      return 'b';
  }
};

export const inCheck = (model: Model): boolean => {
  return createInstance(model).inCheck();
};

export const inDraw = (model: Model): boolean => {
  return createInstance(model).inDraw();
};

export const inCheckmate = (model: Model): boolean => {
  return createInstance(model).inCheckmate();
};

export const inStalemate = (model: Model): boolean => {
  return createInstance(model).inStalemate();
};

export const insufficientMaterial = (model: Model): boolean => {
  return createInstance(model).insufficientMaterial();
};

export const inThreefoldRepetition = (model: Model): boolean => {
  return createInstance(model).inThreefoldRepetition();
};

export const toMissingPieces = (model: Model) => {
  const instance = createInstance(model);
  return instance.history();
};

export const toTurn = (model: Model): Color => {
  const instance = createInstance(model);
  return instance.turn();
};

export type GameOver =
  | {
      type: 'Checkmate';
      winner: Color;
    }
  | {
      type: 'Stalemate';
    };

export const toGameOver = (model: Model): GameOver | { type: 'none' } => {
  if (inCheckmate(model)) {
    return {
      type: 'Checkmate',
      winner: toOppositeColor(toTurn(model)),
    };
  }

  if (inStalemate(model)) {
    return {
      type: 'Stalemate',
    };
  }

  return {
    type: 'none',
  };
};

//
//
//
// Move
//
//
//

export type MoveInput = {
  from: Square;
  to: Square;
  promotion: PieceSymbol;
};

export type MoveProblem = 'invalid_move';

export const move = (
  moveInput: MoveInput,
  model: Model
): Result<MoveProblem, Model & { didCapture: boolean }> => {
  const instance = createInstance(model);

  const moveInput_ = {
    from: toLowercaseSquare(moveInput.from),
    to: toLowercaseSquare(moveInput.to),
    promotion: moveInput.promotion,
  };

  const moved = instance.move(moveInput_);

  if (!moved) {
    return Result.Err('invalid_move');
  }

  // const capturesNew = capturedPieceSymbol ? [...model.captures] : model.captures

  return Result.Ok({
    pgn: instance.pgn(),
    fen: instance.fen(),
    previousMove: moveInput,
    didCapture: Boolean(moved.captured),
  });
};

export const toLegalMoveInputs = (model: Model): MoveInput[] => {
  const instance = createInstance(model);
  const moves = instance.moves({ verbose: true });
  return moves.flatMap(chessTsMoveToMove);
};

export const chessTsMoveToMove = (move: ChessTs.Move): MoveInput[] => {
  if (isLowercaseSquare(move.from) && isLowercaseSquare(move.to)) {
    return [
      {
        from: fromLowercase(move.from),
        to: fromLowercase(move.to),
        promotion: move.promotion ?? 'q',
      },
    ];
  }

  return [];
};

//
//
//
//
// View
//
//
//

export const theme = {
  dark: '#779455',
  light: '#EBEBD0',
};

export const View = ({
  boardOrientation,
  model,
  onPieceDrop,
  isDraggablePiece,
}: {
  boardOrientation: Color;
  model: Model;
  onPieceDrop?: (move: MoveInput) => boolean;
  isDraggablePiece?: ({ piece }: { piece: Piece }) => boolean;
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  const handler = () => {
    if (ref.current) {
      setBoardWidth(ref.current?.offsetWidth);
    }
  };

  useLayoutEffect(() => {
    handler();
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  const instanceRef = useRef(createInstance(model));
  const [legalMoves, setLegalMoves] = useState<MoveInput[]>([]);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const refreshLegalMoves = useCallback(() => {
    const legalMovesNext: MoveInput[] = [];

    for (const chessTsMove of instanceRef.current.moves({ verbose: true })) {
      const move = chessTsMoveToMove(chessTsMove)[0];
      if (move && move.from === selectedSquare) {
        legalMovesNext.push(move);
      }
    }

    setLegalMoves(legalMovesNext);
  }, [setLegalMoves, selectedSquare]);

  useEffect(() => {
    refreshLegalMoves();
  }, [selectedSquare, refreshLegalMoves]);

  useEffect(() => {
    instanceRef.current.load(model.fen);
    refreshLegalMoves();
  }, [model.fen, refreshLegalMoves]);

  const lastMoveStyles: CustomSquareStyles = model.previousMove
    ? {
        [toLowercaseSquare(model.previousMove.to)]: {
          background: 'rgba(255, 255, 0, 0.4)',
        },

        [toLowercaseSquare(model.previousMove.from)]: {
          background: 'rgba(255, 255, 0, 0.4)',
        },
      }
    : {};

  const game = instanceRef.current;

  const legalMovesStyles = legalMoves.reduce<CustomSquareStyles>(
    (styles, move) => ({
      ...styles,
      [toLowercaseSquare(move.to)]:
        game.get(move.to) &&
        selectedSquare &&
        game.get(toLowercaseSquare(move.to))?.color !==
          game.get(toLowercaseSquare(selectedSquare))?.color
          ? {
              background:
                'radial-gradient(circle, rgba(0,0,0,.2) 85%, transparent 85%)',
              borderRadius: '50%',
              cursor: 'pointer',
            }
          : {
              background:
                'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
              borderRadius: '50%',
              cursor: 'pointer',
            },
    }),
    selectedSquare
      ? {
          [toLowercaseSquare(selectedSquare)]: {
            background: 'rgba(255, 255, 0, 0.4)',
          },
        }
      : {}
  );

  useEffect(() => {
    setHoveredSquare(null);
    setSelectedSquare(null);
  }, [model.fen]);

  return (
    <div ref={ref}>
      <Chessboard
        ref={boardRef}
        showBoardNotation
        snapToCursor
        boardOrientation={boardOrientation === 'w' ? 'white' : 'black'}
        position={model.fen}
        boardWidth={boardWidth}
        arePremovesAllowed={true}
        customDarkSquareStyle={{
          backgroundColor: theme.dark,
        }}
        customLightSquareStyle={{
          backgroundColor: theme.light,
        }}
        // onSquareClick={() => {
        //   clearPremoves()
        // }}
        onMouseOverSquare={(square) => {
          setHoveredSquare(fromLowercase(square));
        }}
        onPieceDragBegin={(_piece, sourceSquare) => {
          setSelectedSquare(fromLowercase(sourceSquare));
        }}
        onPieceClick={() => {
          setSelectedSquare(hoveredSquare);
        }}
        customSquareStyles={{
          ...lastMoveStyles,
          ...legalMovesStyles,
        }}
        // customPieces={customPieces}
        isDraggablePiece={
          isDraggablePiece
            ? ({ piece }) => {
                return isDraggablePiece({ piece });
              }
            : undefined
        }
        onPieceDrop={
          onPieceDrop
            ? (from, to, _piece) => {
                const moveInput: MoveInput = {
                  from: fromLowercase(from),
                  to: fromLowercase(to),
                  promotion: 'q',
                };

                return onPieceDrop(moveInput);
              }
            : undefined
        }
      />
    </div>
  );
};

const pieces = [
  'wP',
  'wN',
  'wB',
  'wR',
  'wQ',
  'wK',
  'bP',
  'bN',
  'bB',
  'bR',
  'bQ',
  'bK',
];
const customPieces: {
  [piece: string]: ({ squareWidth }: { squareWidth: number }) => ReactNode;
} = {};
pieces.map((p) => {
  customPieces[p] = ({ squareWidth }) => (
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

//
//
//
//
//
//
//

export const exampleModel: Model = {
  pgn: '[SetUp "1"]\n[FEN "rnbqkbnr/ppp2ppp/4p3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR b KQkq - 1 3"]\n\n3. ... Qd6',
  fen: 'rnb1kbnr/ppp2ppp/3qp3/3p4/3P4/2N1P3/PPP2PPP/R1BQKBNR w KQkq - 2 4',
};

//
//
//
//
//

export const viewCoverArt = () => {
  const theme = {
    // lightSquare: "#EBEBD0",
    // darkSquare: "#779455",
    lightSquare: '#7C6141',
    darkSquare: '#533F30',
    pawn: '#93BA46',
  };
  return (
    <svg width="100%" viewBox={'0 0 2 2'}>
      <rect x={0} y={0} width={1} height={1} fill={theme.lightSquare} />

      <rect x={0} y={1} width={1} height={1} fill={theme.darkSquare} />

      <rect x={1} y={1} width={1} height={1} fill={theme.lightSquare} />

      <rect x={1} y={0} width={1} height={1} fill={theme.darkSquare} />

      <svg
        x={0}
        y={0}
        xmlns="http://www.w3.org/2000/svg"
        width="2"
        height="2"
        viewBox="0 0 45 45"
      >
        <g
          transform="translate(0 -2) scale(0.8)"
          style={{ transformOrigin: 'center' }}
        >
          <path
            fill={theme.pawn}
            stroke={theme.pawn}
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          ></path>
        </g>
      </svg>
    </svg>
  );
};
