import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import { FlowGrid } from "../flow";
import { FlowPuzzleId } from "./flow-puzzle-id";
import { FlowPuzzleName } from "./flow-puzzle-name";

export type Puzzle = {
  t: "grid";
  c: FlowGrid.Model;
};

export const isPuzzle = (x: unknown): x is Puzzle => {
  // @ts-ignore
  return x as Puzzle;
};

export type FlowPuzzle = {
  id: FlowPuzzleId;
  name: FlowPuzzleName;
  puzzle: Puzzle;
  createdAt: Posix;
  createdBy: UserId;
  lastUpdatedAt: Posix;
  lastUpdatedBy: UserId;
};

const create = (input: {
  count: number;
  puzzle: Puzzle;
  createdAt: Posix;
  createdBy: UserId;
}): FlowPuzzle => {
  return {
    name: FlowPuzzleName.generate({ count: input.count }),
    id: FlowPuzzleId.generate(),
    puzzle: input.puzzle,
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    lastUpdatedAt: input.createdAt,
    lastUpdatedBy: input.createdBy,
  };
};

export const FlowPuzzle = {
  create,
  isPuzzle,
};
