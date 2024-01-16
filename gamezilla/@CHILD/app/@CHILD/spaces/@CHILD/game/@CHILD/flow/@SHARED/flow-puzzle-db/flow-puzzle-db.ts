import {
  Paginated,
  Pagination,
  UserId,
} from "gamezilla/@CHILD/app/@SHARED/data";
import { Result } from "gamezilla/@SHARED/core";
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle";

export type IFlowPuzzleDb = {
  list: (input: {
    pagination: Pagination;
    where: {
      createdBy?: UserId;
    };
    order: {
      createdAt?: "asc" | "desc";
    };
  }) => Promise<Result<string, Paginated<FlowPuzzle>>>;
  put: (input: FlowPuzzle) => Promise<Result<string, null>>;
};
