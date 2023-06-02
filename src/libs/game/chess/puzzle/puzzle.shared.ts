import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Posix, RemoteResult, Result } from "@gamezilla/shared/core";
import * as Chess from "../chess/chess";
import { EloRating } from "./elo-rating";
import { interleave, zip } from "./utils";

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

type BaseModel = {
  puzzle: Puzzle;
  queue: Puzzle[];
  profile: PuzzleProfile;
  hasLost?: boolean;
  hasUsedHint?: boolean;
  moves: Chess.MoveInput[];
};

type MainModel =
  | {
      t: "in-progress";
      startedAt: Posix;
      hint?: Hint | null;
    }
  | {
      t: "solved";
      startedAt: Posix;
      endedAt: Posix;
    }
  | {
      t: "solved-with-hint";
      startedAt: Posix;
      endedAt: Posix;
    }
  | {
      t: "incorrect";
      startedAt: Posix;
      endedAt: Posix;
    };

export type SharedModel =
  | {
      t: "loading";
      profile?: PuzzleProfile | null;
      queue?: Puzzle[];
      puzzle?: Puzzle;
    }
  | (BaseModel & MainModel);

export type ServerModel = SharedModel & {
  requests: { getPuzzles?: RemoteResult<string, null> };
};

export type ClientModel = SharedModel & {
  initializedAt?: number;
  backendNow?: Posix;
  openedModal?: "settings" | null;
  draftQuery?: PuzzleQuery;
};

type Hint = "from" | "from-and-to";

const hintToNextHint: { [key in Hint]: Hint } = {
  from: "from-and-to",
  "from-and-to": "from-and-to",
};

export const isNoMoreHints = (model: SharedModel): boolean => {
  return model.t === "in-progress" && model.hint === "from-and-to";
};

export const initQuery: PuzzleQuery = {
  ratingRange: [1000, 1500],
};

export const initShared: SharedModel = {
  t: "loading",
};

export type PuzzleQuery = {
  ratingRange: [number, number];
};

export type Puzzle = {
  puzzleId: string;
  fen: string;
  opponentMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
  correctMoves: [Chess.MoveInput, ...Chess.MoveInput[]];
  rating: EloRating;
  ratingDeviation: number;
  popularity: number;
  numberOfPlays: number;
  themes: string[];
  gameUrl: string;
  openingTags: string[];
};

export type PuzzleProfile = {
  userId: UserId;
  eloRating: EloRating;
  puzzleQuery: PuzzleQuery;
};

export type PuzzleAttempt = {
  type: "solved" | "incorrect" | "solved-with-hint";
  puzzleId: string;
  userId: UserId;
};

//
//
//
// Msg
//
//
//

export type Req =
  | { t: "init" }
  | { t: "input-query"; query: PuzzleQuery }
  | { t: "input-move"; moveInput: Chess.MoveInput }
  | { t: "next" }
  | { t: "retry" }
  | { t: "skip" }
  | { t: "show-hint" };

export type Res = Req & { result: Result<string, SharedModel> };

export type ServerMsg = { t: "clock-tick" } | DbMsg;

type DbMsg =
  | { t: "db-got-puzzles"; result: Result<string, Puzzle[]> }
  | { t: "db-got-profile"; result: Result<string, PuzzleProfile | null> }
  | { t: "db-put-attempt"; result: Result<string, null> }
  | { t: "db-put-profile"; result: Result<string, null> }
  | {
      t: "db-got-initial-load";
      result: Result<string, { profile: PuzzleProfile; puzzles: Puzzle[] }>;
    };

export type ClientMsg =
  | Req
  | { t: "input-draft-query"; query: PuzzleQuery }
  | { t: "animate" }
  | { t: "opened-modal"; modal: "settings" }
  | { t: "closed-modal" }
  | { t: "clicked-save" };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: "clock-tick"; now: Posix }
  | (Omit<DbMsg, "result"> & { result: Result<string, SharedModel> });

export const toOpponentColor = (puzzle: Puzzle): Chess.Color => {
  return Chess.toTurn(Chess.initFromFen({ fen: puzzle.fen }));
};

export const toPlayerColor = (puzzle: Puzzle): Chess.Color => {
  return Chess.toOppositeColor(toOpponentColor(puzzle));
};

export const toCorrectMove = (model: SharedModel): Chess.MoveInput | null => {
  if (model.t === "in-progress") {
    return model.puzzle.correctMoves[model.moves.length] ?? null;
  }
  return null;
};

//
//
//
//
// Handle
//
//
//
//

export const toCurrentBoard = (model: SharedModel): Chess.Model => {
  if (model.t === "loading") {
    return Chess.init();
  }
  const moves = interleave(model.puzzle.opponentMoves, model.moves);

  const board = moves.reduce((board, move) => {
    const moved = Chess.move(move, board);
    if (moved.t === "ok") {
      return moved.value;
    }
    return board;
  }, Chess.initFromFen(model.puzzle));

  return board;
};

const didSolvePuzzle = (puzzle: Puzzle, moves: Chess.MoveInput[]): boolean => {
  return (
    puzzle.correctMoves.length === moves.length &&
    zip(puzzle.correctMoves, moves).every(
      ([a, b]) => a.from === b.from && a.to === b.to
    )
  );
};

const didFailPuzzle = (puzzle: Puzzle, moves: Chess.MoveInput[]): boolean => {
  return zip(puzzle.correctMoves, moves).some(
    ([a, b]) => !(a.from === b.from && a.to === b.to)
  );
};

type Ctx = { now: Posix; currentUserId: UserId; hostId: UserId };

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: Ctx;
  msg: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
  //
  //
  //
  //

  if (ctx.currentUserId !== ctx.hostId) {
    return Err("must-be-host");
  }

  //
  //
  //
  //

  if (model.t === "in-progress") {
    if (msg.t === "input-move") {
      const board = toCurrentBoard(model);

      const moved = Chess.move(msg.moveInput, board);

      if (moved.t === "err") {
        return moved;
      }

      const modelNew: SharedModel = {
        ...model,
        moves: [...model.moves, msg.moveInput],
        hint: null,
      };

      if (didSolvePuzzle(model.puzzle, modelNew.moves) && model.hasUsedHint) {
        return Ok({
          ...modelNew,
          t: "solved-with-hint",
          endedAt: ctx.now,
          hasLost: true,
          hasUsedHint: true,
        });
      }

      if (didSolvePuzzle(model.puzzle, modelNew.moves)) {
        return Ok({
          ...modelNew,
          t: "solved",
          endedAt: ctx.now,
        });
      }

      if (didFailPuzzle(model.puzzle, modelNew.moves)) {
        return Ok({
          ...modelNew,
          t: "incorrect",
          hasLost: true,
          endedAt: ctx.now,
        });
      }

      return Ok(modelNew);
    }

    if (msg.t === "show-hint") {
      return Ok({
        ...model,
        hint: model.hint ? hintToNextHint[model.hint] : "from",
        hasUsedHint: true,
      });
    }
  }

  if (model.t === "solved") {
    if (msg.t === "next") {
      return Ok(transitionNextPuzzle({ ctx, model }));
    }
  }

  if (model.t === "solved-with-hint") {
    if (msg.t === "next") {
      return Ok(transitionNextPuzzle({ ctx, model }));
    }
  }

  if (model.t === "incorrect") {
    if (msg.t === "next") {
      return Ok(transitionNextPuzzle({ ctx, model }));
    }

    if (msg.t === "skip") {
      return Ok(transitionNextPuzzle({ ctx, model }));
    }

    if (msg.t === "retry") {
      return Ok({
        ...model,
        moves: [],
        t: "in-progress",
        hasLost: true,
      });
    }
  }

  return Err("unhandled");
};

const transitionNextPuzzle = ({
  model,
  ctx,
}: {
  ctx: Ctx;
  model: SharedModel;
}): SharedModel => {
  if (model.t === "loading") {
    return model;
  }

  const puzzleNext = model.queue[0];

  if (!puzzleNext) {
    return { ...model, t: "loading" };
  }

  const eloRating = toNextEloRating(model) ?? model.profile.eloRating;

  return {
    t: "in-progress",
    hasLost: false,
    startedAt: ctx.now,
    moves: [],
    profile: { ...model.profile, eloRating },
    puzzle: puzzleNext,
    queue: model.queue.slice(1),
    hint: null,
  };
};

export const toNextEloRating = (model: SharedModel): EloRating | null => {
  if (model.t === "loading") {
    return null;
  }

  if (model.hasLost) {
    return EloRating.toNextRating({
      endGame: "lost",
      opponentRating: model.puzzle.rating,
      playerRating: model.profile.eloRating,
    });
  }

  if (model.t === "in-progress") {
    return model.profile.eloRating;
  }

  if (model.t === "solved") {
    return EloRating.toNextRating({
      endGame: "win",
      opponentRating: model.puzzle.rating,
      playerRating: model.profile.eloRating,
    });
  }

  return EloRating.toNextRating({
    endGame: "lost",
    opponentRating: model.puzzle.rating,
    playerRating: model.profile.eloRating,
  });
};

export const transitionToInProgress = ({
  model,
  ctx,
}: {
  ctx: { now: Posix };
  model: SharedModel;
}): SharedModel => {
  if (model.t === "loading") {
    const profile = model.profile;

    if (!profile) {
      return model;
    }

    const puzzle = model.puzzle;
    const queue = model.queue;

    if (puzzle) {
      return {
        ...model,
        profile: profile,
        queue: queue ?? [],
        puzzle,
        moves: [],
        startedAt: ctx.now,
        t: "in-progress",
      };
    }

    const [head, ...tail] = queue ?? [];

    if (!head) {
      return model;
    }

    return {
      ...model,
      profile: profile,
      queue: tail,
      puzzle: head,
      moves: [],
      startedAt: ctx.now,
      t: "in-progress",
    };
  }

  return model;
};
