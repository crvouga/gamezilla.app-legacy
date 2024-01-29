import {
  Paginated,
  Pagination,
  UserId,
} from "gamezilla/@CHILD/app/@SHARED/data";
import { Result } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id";

export type IFlowPuzzleDb = {
  count: (input: {
    where: {
      createdBy?: UserId;
    };
  }) => Promise<Result<string, number>>;
  list: (input: {
    pagination: Pagination;
    where: {
      createdBy?: UserId;
    };
    order: {
      createdAt?: "asc" | "desc";
      lastUpdatedAt?: "asc" | "desc";
    };
  }) => Promise<Result<string, Paginated<FlowPuzzle>>>;
  get: (id: FlowPuzzleId) => Promise<Result<string, FlowPuzzle | null>>;
  put: (input: FlowPuzzle) => Promise<Result<string, null>>;
  zap: (id: FlowPuzzleId) => Promise<Result<string, null>>;
};
