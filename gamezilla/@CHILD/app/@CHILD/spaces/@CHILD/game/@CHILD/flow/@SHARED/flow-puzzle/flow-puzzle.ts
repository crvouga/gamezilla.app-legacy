import { Posix } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../flow";
import { FlowPuzzleId } from "./flow-puzzle-id";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { P } from "gamezilla/@SHARED/parsing";

export type Puzzle = {
  t: "grid";
  c: FlowGrid.Model;
};

export type FlowPuzzle = {
  id: FlowPuzzleId;
  puzzle: Puzzle;
  createdAt: Posix;
  createdBy: UserId;
  lastUpdatedAt?: Posix | null;
  lastUpdatedBy?: UserId | null;
};

const create = (input: {
  puzzle: Puzzle;
  createdAt: Posix;
  createdBy: UserId;
}): FlowPuzzle => {
  return {
    id: FlowPuzzleId.generate(),
    puzzle: input.puzzle,
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: null,
    lastUpdatedBy: null,
  };
};

export const to = (x: unknown): FlowPuzzle | null => {
  if (
    P.obj(x) &&
    P.has(x, "id", FlowPuzzleId.is) &&
    // P.has(x, "puzzle", isPuzzle) &&
    P.has(x, "createdAt", Posix.is) &&
    P.has(x, "createdBy", UserId.is) &&
    P.has(x, "lastUpdatedAt", P.or(Posix.is, P.nullish)) &&
    P.has(x, "lastUpdatedBy", P.or(UserId.is, P.nullish))
  ) {
    return null;
  }
  return null;
};

export const FlowPuzzle = {
  create,
};
