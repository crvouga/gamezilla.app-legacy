import { Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as ChessBoard from '../chess/chess-board';
const { Err, Ok } = Result;

export type SharedModel = {
  puzzle?: Puzzle;
  query: PuzzleQuery;
  moves: ChessBoard.MoveInput[];
  puzzleState:
    | { type: 'solving' }
    | { type: 'solved' }
    | { type: 'solved-with-hint' }
    | { type: 'incorrect' };
};

const initQuery: PuzzleQuery = {
  ratingRange: {
    direction: 'descend',
    value: 600,
  },
  popularity: {
    direction: 'descend',
    value: 100,
  },
  pageSize: 10,
  pageIndex: 0,
};

export const initShared: SharedModel = {
  moves: [],
  query: initQuery,
  puzzleState: {
    type: 'solving',
  },
};

type SortDirection = 'ascend' | 'descend';

export type PuzzleQuery = {
  ratingRange: {
    direction: SortDirection;
    value: number;
  };
  popularity: {
    direction: SortDirection;
    value: number;
  };
  pageSize: number;
  pageIndex: number;
};

export type Puzzle = {
  puzzleId: string;
  fen: string;
  opponentMoves: [ChessBoard.MoveInput, ...ChessBoard.MoveInput[]];
  correctMoves: [ChessBoard.MoveInput, ...ChessBoard.MoveInput[]];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  numberOfPlays: number;
  themes: string[];
  gameUrl: string;
  openingTags: string[];
};

export type Status =
  | {
      type: 'loading';
    }
  | {
      type: 'solving';
      puzzle: Puzzle;
      board: ChessBoard.Model;
    }
  | {
      type: 'solved';
      puzzle: Puzzle;
      board: ChessBoard.Model;
    }
  | {
      type: 'incorrect';
      puzzle: Puzzle;
      board: ChessBoard.Model;
    };

export const toStatus = (model: SharedModel): Status => {
  if (!model.puzzle) {
    return {
      type: 'loading',
    };
  }

  const puzzle = model.puzzle;

  if (isMovesEqual(model.puzzle.correctMoves, model.moves)) {
    const allMoves = interleave(puzzle.opponentMoves, model.moves);
    const board = moveMany(allMoves, ChessBoard.initFromFen(puzzle));

    return {
      type: 'solved',
      puzzle,
      board,
    };
  }

  if (didMakeWrongMove(model)) {
    const opponentMoves = puzzle.opponentMoves.slice(0, model.moves.length);
    const allMoves = interleave(opponentMoves, model.moves);
    const board = moveMany(allMoves, ChessBoard.initFromFen(puzzle));

    return {
      type: 'incorrect',
      puzzle,
      board,
    };
  }

  const opponentMoves = puzzle.opponentMoves.slice(0, model.moves.length + 1);
  const allMoves = interleave(opponentMoves, model.moves);
  const board = moveMany(allMoves, ChessBoard.initFromFen(puzzle));

  return {
    type: 'solving',
    puzzle,
    board,
  };
};

const moveMany = (
  moves: ChessBoard.MoveInput[],
  board: ChessBoard.Model
): ChessBoard.Model => {
  return moves.reduce((board, move) => {
    const moved = ChessBoard.move(move, board);
    return moved.type === 'Ok' ? moved.value : board;
  }, board);
};

const didMakeWrongMove = (model: SharedModel): boolean => {
  return (
    model.moves.length > 0 &&
    model.moves.every((move, index) => {
      const correctMove = model.puzzle?.correctMoves[index];
      return correctMove && !isMoveEqual(move, correctMove);
    })
  );
};

const isMovesEqual = (
  a: ChessBoard.MoveInput[],
  b: ChessBoard.MoveInput[]
): boolean => {
  return (
    a.length === b.length &&
    a.every((move, index) => {
      const bi = b[index];
      return bi && isMoveEqual(move, bi);
    })
  );
};

const isMoveEqual = (
  a: ChessBoard.MoveInput,
  b: ChessBoard.MoveInput
): boolean => {
  return a.from === b.from && a.to === b.to;
};

export const toCurrentBoard = ({
  puzzle,
  model,
}: {
  puzzle: Puzzle;
  model: SharedModel;
}): ChessBoard.Model => {
  const opponentMoves = puzzle.opponentMoves.slice(0, model.moves.length + 1);

  const allMoves = interleave(opponentMoves, model.moves);

  const currentBoard = allMoves.reduce(
    moveReducer,
    ChessBoard.initFromFen({ fen: puzzle.fen })
  );

  return currentBoard;
};

const moveReducer = (
  board: ChessBoard.Model,
  move: ChessBoard.MoveInput
): ChessBoard.Model => {
  const moved = ChessBoard.move(move, board);
  if (moved.type === 'Err') {
    return board;
  }
  return moved.value;
};

const zip = <T>(a: T[], b: T[]): [T, T][] => {
  const [headA, ...tailA] = a;
  const [headB, ...tailB] = b;
  if (!headA || !headB) {
    return [];
  }
  return [[headA, headB], ...zip(tailA, tailB)];
};

export const toOpponentColor = (puzzle: Puzzle): ChessBoard.Color => {
  const board = ChessBoard.initFromFen({ fen: puzzle.fen });
  return ChessBoard.toTurn(board);
};

export const toPlayerColor = (puzzle: Puzzle): ChessBoard.Color => {
  return ChessBoard.toOppositeColor(toOpponentColor(puzzle));
};

const interleave = <T>(a: T[], b: T[]): T[] => {
  const [head, ...tail] = a;
  if (!head) {
    return b;
  }
  return [head, ...interleave(b, tail)];
};

export type PuzzleCompleted = {
  puzzleId: string;
  userId: string;
  seconds: number;
};

export type Req = ['input-move', { moveInput: ChessBoard.MoveInput }];

export type Res = [Req[0], Result<string, SharedModel>];

export type BackendMsg = ['initialize', Result<string, Puzzle[]>];

export type FrontendMsg = Req | ['animate'];

export type ToBackend = Req | ['initialize'];

export type ToFrontend = Res | ['initialize', Result<string, SharedModel>];

export type BackendModel = SharedModel;

export type FrontendModel = SharedModel & {
  initializedAt?: number;
};

type Problem =
  | 'must-be-host'
  | 'no-active-puzzle'
  | 'must-be-turn'
  | 'must-be-solving'
  | 'no-correct-move-found'
  | ChessBoard.MoveProblem;

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<Problem, SharedModel> => {
  switch (msg[0]) {
    case 'input-move': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const status = toStatus(model);

      if (status.type !== 'solving') {
        return Err('must-be-solving');
      }

      const moved = ChessBoard.move(msg[1].moveInput, status.board);

      if (moved.type === 'Err') {
        return moved;
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [...model.moves, msg[1].moveInput],
      };

      return Ok(modelNew);
    }

    default: {
      return Ok(model);
    }
  }
};
