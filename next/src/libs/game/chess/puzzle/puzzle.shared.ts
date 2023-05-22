import { exhaustive, Posix, Result } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import { z } from 'zod';
import * as Chess from '../chess/chess';

const { Err, Ok } = Result;

export const maxRating = 3212;
export const minRating = 545;
export const maxRatingDeviation = 500;
export const minRatingDeviation = 50;

export type SharedModel = {
  startedAt: number | null;
  lastMoveAt: number | null;
  query: PuzzleQuery;
  moves: Chess.MoveInput[];
  hint: Hint;
  puzzles: Puzzle[];
};

type Hint = 'none' | 'from' | 'from-and-to';

const initQuery: PuzzleQuery = {
  ratingRange: [1000, 1500],
};

export type ChessLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Master'
  | 'Grandmaster';

export const toChessLevel = (rating: number): ChessLevel => {
  if (rating < 800) {
    return 'Beginner';
  }
  if (rating < 1200) {
    return 'Intermediate';
  }
  if (rating < 1600) {
    return 'Advanced';
  }
  if (rating < 2000) {
    return 'Expert';
  }
  if (rating < 2400) {
    return 'Master';
  }
  return 'Grandmaster';
};

export const initShared: SharedModel = {
  moves: [],
  query: initQuery,
  hint: 'none',
  puzzles: [],
  lastMoveAt: null,
  startedAt: null,
};

export const PuzzleQuery = z.object({
  ratingRange: z.tuple([
    z.number().min(minRating).max(maxRating),
    z.number().min(minRating).max(maxRating),
  ]),
});
export type PuzzleQuery = z.infer<typeof PuzzleQuery>;

export type Puzzle = {
  puzzleId: string;
  fen: string;
  opponentMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
  correctMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
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
      board: Chess.Model;
    }
  | {
      type: 'solved';
      puzzle: Puzzle;
      board: Chess.Model;
      endedAt: number;
    }
  | {
      type: 'incorrect';
      puzzle: Puzzle;
      board: Chess.Model;
      endedAt: number;
    };

export const toStatus = (model: SharedModel): Status => {
  const puzzle = model.puzzles[0];
  if (!puzzle) {
    return {
      type: 'loading',
    };
  }

  if (isMovesEqual(puzzle.correctMoves, model.moves)) {
    const allMoves = interleave(puzzle.opponentMoves, model.moves);
    const board = moveMany(allMoves, Chess.initFromFen(puzzle));

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
    const board = moveMany(allMoves, Chess.initFromFen(puzzle));

    return {
      type: 'incorrect',
      puzzle,
      board,
      endedAt: model.lastMoveAt ?? model.startedAt ?? 0,
    };
  }

  const opponentMoves = puzzle.opponentMoves.slice(0, model.moves.length + 1);
  const allMoves = interleave(opponentMoves, model.moves);
  const board = moveMany(allMoves, Chess.initFromFen(puzzle));

  return {
    type: 'solving',
    puzzle,
    board,
  };
};

const moveMany = (
  moves: Chess.MoveInput[],
  board: Chess.Model
): Chess.Model => {
  return moves.reduce((board, move) => {
    const moved = Chess.move(move, board);
    return moved.t === 'ok' ? moved.value : board;
  }, board);
};

const didMakeWrongMove = (model: SharedModel): boolean => {
  return (
    model.moves.length > 0 &&
    model.moves.some((move, index) => {
      const correctMove = model.puzzles[0]?.correctMoves[index];
      return correctMove && !isMoveEqual(move, correctMove);
    })
  );
};

const isMovesEqual = (a: Chess.MoveInput[], b: Chess.MoveInput[]): boolean => {
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

const isMoveEqual = (a: Chess.MoveInput, b: Chess.MoveInput): boolean => {
  return a.from === b.from && a.to === b.to;
};

export const toOpponentColor = (puzzle: Puzzle): Chess.Color => {
  const board = Chess.initFromFen({ fen: puzzle.fen });
  return Chess.toTurn(board);
};

export const toPlayerColor = (puzzle: Puzzle): Chess.Color => {
  return Chess.toOppositeColor(toOpponentColor(puzzle));
};

export const toCorrectMove = (model: SharedModel): Chess.MoveInput | null => {
  const move = model.puzzles[0]?.correctMoves[model.moves.length];
  return move ?? null;
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
  | { t: 'init' }
  | { t: 'input-query'; query: PuzzleQuery }
  | { t: 'input-move'; moveInput: Chess.MoveInput }
  | { t: 'next' }
  | { t: 'retry' }
  | { t: 'skip' }
  | { t: 'show-hint' };

export type Res = Req & { result: Result<Problem, SharedModel> };

export type ServerMsg =
  | { t: 'clock-tick' }
  | { t: 'fetched-puzzles'; result: Result<string, Puzzle[]> }
  | { t: 'interaction-insert-done'; result: Result<string, null> };

export type ClientMsg =
  | Req
  | { t: 'input-draft-query'; query: PuzzleQuery }
  | { t: 'animate' }
  | { t: 'opened-modal'; modal: 'tune' }
  | { t: 'closed-modal' }
  | { t: 'clicked-save' };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: 'clock-tick'; now: Posix }
  | { t: 'fetched-puzzles'; result: Result<string, SharedModel> }
  | { t: 'interaction-insert-done'; result: Result<string, SharedModel> };

export type ServerModel = SharedModel;

export type ClientModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
  openedModal?: 'tune' | null;
  draftQuery?: PuzzleQuery;
};

type Problem =
  | 'must-be-host'
  | 'no-active-puzzle'
  | 'must-be-turn'
  | 'must-be-solving'
  | 'must-be-solved'
  | 'must-be-incorrect'
  | 'no-correct-move-found'
  | Chess.MoveProblem;

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

      const moved = Chess.move(msg.moveInput, status.board);

      if (moved.t === 'err') {
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

      const modelNew = nextPuzzle({
        model,
        ctx,
      });

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

      const modelNew: SharedModel = nextPuzzle({
        model,
        ctx,
      });

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

    case 'input-query': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      const modelNew = nextPuzzle({
        ctx,
        model: {
          ...model,
          query: msg.query,
        },
      });

      return Ok(modelNew);
    }

    case 'init': {
      return Ok(model);
    }

    default: {
      return exhaustive(msg);
    }
  }
};

const nextPuzzle = ({
  ctx,
  model,
}: {
  ctx: { now: Posix };
  model: SharedModel;
}): SharedModel => {
  return {
    startedAt: ctx.now,
    lastMoveAt: null,
    moves: [],
    puzzles: model.puzzles.slice(1),
    hint: 'none',
    query: model.query,
  };
};
