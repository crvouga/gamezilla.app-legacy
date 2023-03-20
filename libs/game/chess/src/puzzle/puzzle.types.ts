import { Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as ChessBoard from '../chess/chess-board';
const { Err, Ok } = Result;

export type SharedModel = {
  activePuzzle?: Puzzle;
  activeQuery: PuzzleQuery;
  playerMoves: ChessBoard.MoveInput[];
};

export const initShared: SharedModel = {
  playerMoves: [],
  activeQuery: {
    ratingRange: {
      direction: 'descend',
      value: 1000,
    },
    popularity: {
      direction: 'descend',
      value: 100,
    },
    pageSize: 10,
    pageIndex: 0,
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
  moves: [
    ChessBoard.MoveInput,
    ChessBoard.MoveInput,
    ...ChessBoard.MoveInput[]
  ];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  numberOfPlays: number;
  themes: string[];
  gameUrl: string;
  openingTags: string[];
};

export const toOpponentMoves = (
  puzzle: Puzzle
): [ChessBoard.MoveInput, ...ChessBoard.MoveInput[]] => {
  const [firstMove, ...rest] = puzzle.moves;
  return [firstMove, ...toOddElements(rest)];
};

const toOddElements = <T>(arr: T[]): T[] => {
  const oddElements: T[] = [];
  for (let i = 0; i < arr.length; i += 2) {
    const element = arr[i];
    if (!element) {
      continue;
    }
    const isOddIndex = i % 2 !== 0;
    if (!isOddIndex) {
      continue;
    }
    oddElements.push(element);
  }
  return oddElements;
};

export const toCurrentBoard = ({
  activePuzzle,
  model,
}: {
  activePuzzle: Puzzle;
  model: SharedModel;
}): ChessBoard.Model => {
  const opponentMoves = toOpponentMoves(activePuzzle);
  const allMoves = interleave(opponentMoves, model.playerMoves);

  const currentBoard = allMoves.reduce((board, move) => {
    const moved = ChessBoard.move(move, board);
    if (moved.type === 'Err') {
      return board;
    }
    return moved.value;
  }, ChessBoard.initFromFen({ fen: activePuzzle.fen }));

  return currentBoard;
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

export type Res = [...Req, Result<string, Puzzle[]>];

export type BackendMsg = ['initialize', Result<string, Puzzle[]>];

export type FrontendMsg = Req | ['animate'];

export type ToBackend = Req | ['initialize'];

export type ToFrontend = Res | ['initialize', Result<string, SharedModel>];

export type BackendModel = SharedModel;

export type FrontendModel = SharedModel & {
  initializedAt?: number;
};

type Problem = 'must-be-host' | 'puzzle-not-found';

export const handle = async ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: SharedModel;
}): Promise<Result<Problem, SharedModel>> => {
  switch (msg[0]) {
    case 'input-move': {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err('must-be-host');
      }

      // const { moveInput, puzzle } = msg[1];

      // const boardModel = ChessBoard.initFromFen({ fen: puzzle.fen });

      // const _moved = ChessBoard.move(moveInput, boardModel);

      return Ok(model);
    }

    default: {
      return Ok(model);
    }
  }
};
