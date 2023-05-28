import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Posix, Result } from "@gamezilla/shared/core";
import * as Chess from "../chess/chess";
import { interleave } from "./utils";

export const maxRating = 3212;
export const minRating = 545;
export const maxRatingDeviation = 500;
export const minRatingDeviation = 50;

//
//
//
// Model
//
//
//

export type SharedModel = {
  startedAt: number | null;
  lastMoveAt: number | null;
  playerMoves: Chess.MoveInput[];
  hint: Hint;
  puzzles: Puzzle[];
  puzzleProfile: PuzzleProfile | null;
};

export type ServerModel = SharedModel;

export type ClientModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
  openedModal?: "tune" | null;
  draftQuery?: PuzzleQuery;
};

type Hint = "none" | "from" | "from-and-to";

export const initQuery: PuzzleQuery = {
  ratingRange: [1000, 1500],
};

export const initShared: SharedModel = {
  playerMoves: [],
  hint: "none",
  puzzles: [],
  puzzleProfile: null,
  lastMoveAt: null,
  startedAt: null,
};

export type PuzzleQuery = {
  ratingRange: [number, number];
};

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

export type PuzzleProfile = {
  userId: UserId;
  eloRating: number;
  query: PuzzleQuery;
};

export type PuzzleInteraction =
  | {
      type: "solved";
      puzzleId: string;
      userId: UserId;
    }
  | {
      type: "incorrect";
      puzzleId: string;
      userId: UserId;
    };

export type Req =
  | { t: "init" }
  | { t: "input-query"; query: PuzzleQuery }
  | { t: "input-move"; moveInput: Chess.MoveInput }
  | { t: "next" }
  | { t: "retry" }
  | { t: "skip" }
  | { t: "show-hint" };

export type Res = Req & { result: Result<Problem, SharedModel> };

export type ServerMsg =
  | { t: "clock-tick" }
  | { t: "got-puzzles"; result: Result<string, Puzzle[]> }
  | { t: "got-profile"; result: Result<string, PuzzleProfile | null> }
  | { t: "put-interaction"; result: Result<string, null> };

export type ClientMsg =
  | Req
  | { t: "input-draft-query"; query: PuzzleQuery }
  | { t: "animate" }
  | { t: "opened-modal"; modal: "tune" }
  | { t: "closed-modal" }
  | { t: "clicked-save" };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: "clock-tick"; now: Posix }
  | { t: "got-puzzles"; result: Result<string, SharedModel> }
  | { t: "got-profile"; result: Result<string, SharedModel> }
  | { t: "put-interaction"; result: Result<string, SharedModel> };

export type Status =
  | {
      type: "loading";
    }
  | {
      type: "solving";
      puzzle: Puzzle;
      board: Chess.Model;
    }
  | {
      type: "solved";
      puzzle: Puzzle;
      board: Chess.Model;
      endedAt: number;
    }
  | {
      type: "incorrect";
      puzzle: Puzzle;
      board: Chess.Model;
      endedAt: number;
    };

export const toStatus = (model: SharedModel): Status => {
  const puzzle = model.puzzles[0];
  if (!puzzle) {
    return {
      type: "loading",
    };
  }

  if (isMovesEqual(puzzle.correctMoves, model.playerMoves)) {
    const allMoves = interleave(puzzle.opponentMoves, model.playerMoves);
    const board = moveMany(allMoves, Chess.initFromFen(puzzle));

    return {
      type: "solved",
      puzzle,
      board,
      endedAt: model.lastMoveAt ?? model.startedAt ?? 0,
    };
  }

  if (didMakeWrongMove(model)) {
    const opponentMoves = puzzle.opponentMoves.slice(
      0,
      model.playerMoves.length
    );
    const allMoves = interleave(opponentMoves, model.playerMoves);
    const board = moveMany(allMoves, Chess.initFromFen(puzzle));

    return {
      type: "incorrect",
      puzzle,
      board,
      endedAt: model.lastMoveAt ?? model.startedAt ?? 0,
    };
  }

  const opponentMoves = puzzle.opponentMoves.slice(
    0,
    model.playerMoves.length + 1
  );
  const allMoves = interleave(opponentMoves, model.playerMoves);
  const board = moveMany(allMoves, Chess.initFromFen(puzzle));

  return {
    type: "solving",
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
    return moved.t === "ok" ? moved.value : board;
  }, board);
};

const didMakeWrongMove = (model: SharedModel): boolean => {
  return (
    model.playerMoves.length > 0 &&
    model.playerMoves.some((move, index) => {
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
  if (status.type === "solved" || status.type === "incorrect") {
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
  const move = model.puzzles[0]?.correctMoves[model.playerMoves.length];
  return move ?? null;
};

type Problem =
  | "must-be-host"
  | "no-active-puzzle"
  | "must-be-turn"
  | "must-be-solving"
  | "must-be-solved"
  | "must-be-incorrect"
  | "no-correct-move-found"
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
    case "input-move": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toStatus(model);

      if (status.type !== "solving") {
        return Err("must-be-solving");
      }

      const moved = Chess.move(msg.moveInput, status.board);

      if (moved.t === "err") {
        return moved;
      }

      const modelNew: SharedModel = {
        ...model,
        playerMoves: [...model.playerMoves, msg.moveInput],
        lastMoveAt: ctx.now,
      };

      return Ok(modelNew);
    }

    case "next": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toStatus(model);

      if (status.type !== "solved") {
        return Err("must-be-solved");
      }

      const modelNew = nextPuzzle({
        model,
        ctx,
      });

      return Ok(modelNew);
    }

    case "retry": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toStatus(model);

      if (status.type !== "incorrect") {
        return Err("must-be-incorrect");
      }

      const modelNew: SharedModel = {
        ...model,
        playerMoves: [],
        lastMoveAt: null,
        startedAt: ctx.now,
      };

      return Ok(modelNew);
    }

    case "skip": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const status = toStatus(model);

      if (status.type !== "incorrect") {
        return Err("must-be-incorrect");
      }

      const modelNew: SharedModel = nextPuzzle({
        model,
        ctx,
      });

      return Ok(modelNew);
    }

    case "show-hint": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const toNext: { [key in Hint]: Hint } = {
        none: "from",
        from: "from-and-to",
        "from-and-to": "from-and-to",
      };

      const modelNew: SharedModel = {
        ...model,
        hint: toNext[model.hint],
      };

      return Ok(modelNew);
    }

    case "input-query": {
      if (ctx.currentUserId !== ctx.hostId) {
        return Err("must-be-host");
      }

      const modelNew = nextPuzzle({
        ctx,
        model: {
          ...model,
          puzzleProfile: model.puzzleProfile
            ? {
                ...model.puzzleProfile,
                query: msg.query,
              }
            : null,
        },
      });

      return Ok(modelNew);
    }

    case "init": {
      return Ok(model);
    }

    default: {
      const check: never = msg;
      return check;
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
    playerMoves: [],
    puzzles: model.puzzles.slice(1),
    hint: "none",
    puzzleProfile: null,
  };
};
