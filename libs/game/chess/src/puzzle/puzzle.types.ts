import { exhaustive, Posix, Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as ChessBoard from '../chess/chess-board';

const { Err, Ok } = Result;

export type SharedModel = {
  puzzle: Puzzle | null;
  startedAt: number | null;
  lastMoveAt: number | null;
  query: PuzzleQuery;
  moves: ChessBoard.MoveInput[];
  hint: Hint;
  puzzles: Puzzle[];
};

type Hint = 'none' | 'from' | 'from-and-to';

const initQuery: PuzzleQuery = {
  rating: 600,
  index: 0,
};

export const initShared: SharedModel = {
  puzzle: null,
  moves: [],
  query: initQuery,
  hint: 'none',
  puzzles: [],
  lastMoveAt: null,
  startedAt: null,
};

export type PuzzleQuery = {
  rating: number;
  index: number;
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

export type PuzzleInteraction =
  | {
      type: 'solved';
      puzzleId: string;
      userId: UserId;
    }
  | {
      type: 'incorrect';
      puzzleId: string;
      userId: UserId;
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
      endedAt: number;
    }
  | {
      type: 'incorrect';
      puzzle: Puzzle;
      board: ChessBoard.Model;
      endedAt: number;
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
      endedAt: model.lastMoveAt ?? model.startedAt ?? 0,
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
      endedAt: model.lastMoveAt ?? model.startedAt ?? 0,
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
    model.moves.some((move, index) => {
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

export const toEndedAt = (model: SharedModel): number | null => {
  const status = toStatus(model);
  if (status.type === 'solved' || status.type === 'incorrect') {
    return model.lastMoveAt ?? null;
  }
  return null;
};

const isMoveEqual = (
  a: ChessBoard.MoveInput,
  b: ChessBoard.MoveInput
): boolean => {
  return a.from === b.from && a.to === b.to;
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

export type Req =
  | { t: 'input-move'; moveInput: ChessBoard.MoveInput }
  | { t: 'next' }
  | { t: 'retry' }
  | { t: 'skip' }
  | { t: 'show-hint' };

export type Res = Req & { result: Result<Problem, SharedModel> };

export type BackendMsg =
  | { t: 'clock-tick' }
  | { t: 'initialize'; result: Result<string, Puzzle[]> }
  | { t: 'next-done'; result: Result<string, Puzzle[]> }
  | { t: 'interaction-insert-done'; result: Result<string, null> };

export type FrontendMsg = Req | { t: 'animate' };

export type ToBackend = Req | { t: 'initialize' };

export type ToFrontend =
  | Res
  | { t: 'clock-tick'; now: Posix }
  | { t: 'initialize'; result: Result<string, SharedModel> }
  | { t: 'next-done'; result: Result<string, SharedModel> }
  | { t: 'interaction-insert-done'; result: Result<string, SharedModel> };

export type BackendModel = SharedModel & {
  isUploading?: boolean;
};

export type FrontendModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
};

type Problem =
  | 'must-be-host'
  | 'no-active-puzzle'
  | 'must-be-turn'
  | 'must-be-solving'
  | 'must-be-solved'
  | 'must-be-incorrect'
  | 'no-correct-move-found'
  | ChessBoard.MoveProblem;

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { now: Posix; currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<Problem, SharedModel> => {
  switch (msg.t) {
    case 'input-move': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const status = toStatus(model);

      if (status.type !== 'solving') {
        return Err('must-be-solving');
      }

      const moved = ChessBoard.move(msg.moveInput, status.board);

      if (moved.type === 'Err') {
        return moved;
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [...model.moves, msg.moveInput],
        lastMoveAt: ctx.now,
      };

      return Ok(modelNew);
    }

    case 'next': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const status = toStatus(model);

      if (status.type !== 'solved') {
        return Err('must-be-solved');
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [],
        puzzle: null,
        query: {
          ...model.query,
          index: model.query.index + 1,
        },
      };

      return Ok(modelNew);
    }

    case 'retry': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const status = toStatus(model);

      if (status.type !== 'incorrect') {
        return Err('must-be-incorrect');
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [],
        lastMoveAt: null,
        startedAt: ctx.now,
      };

      return Ok(modelNew);
    }

    case 'skip': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const status = toStatus(model);

      if (status.type !== 'incorrect') {
        return Err('must-be-incorrect');
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [],
        puzzle: null,
        query: {
          ...model.query,
          index: model.query.index + 1,
        },
      };

      return Ok(modelNew);
    }

    case 'show-hint': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const toNext: { [key in Hint]: Hint } = {
        none: 'from',
        from: 'from-and-to',
        'from-and-to': 'from-and-to',
      };

      const modelNew: SharedModel = {
        ...model,
        hint: toNext[model.hint],
      };

      return Ok(modelNew);
    }

    default: {
      return exhaustive(msg);
    }
  }
};
