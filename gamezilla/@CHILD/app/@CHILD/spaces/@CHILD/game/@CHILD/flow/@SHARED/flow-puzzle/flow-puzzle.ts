import { Posix } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../flow";
import { FlowPuzzleId } from "./flow-puzzle-id";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type Puzzle = {
  t: "grid";
  c: FlowGrid.Model;
};

export type FlowPuzzle = {
  id: FlowPuzzleId;
  puzzle: Puzzle;
  createdAt: Posix;
  createdBy: UserId;
  lastUpdatedAt: Posix | null;
  lastUpdatedBy: UserId | null;
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

export const FlowPuzzle = {
  create,
};
