import { RemoteResult, notAsked } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../../@SHARED/flow-puzzle-db";
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
//

export type ModelClient = {
  puzzleListRequest: RemoteResult<string, null>;
};

export const initClient: ModelClient = {
  puzzleListRequest: notAsked,
};

export type MsgClient =
  | { t: "list/user-observed-end-of-list" }
  | { t: "list/user-clicked-puzzle-list-item"; puzzle: FlowPuzzle };

export type MsgServer = { t: "noop" };

export type MsgToServer = { t: "list/list-puzzles"; input: ListPuzzlesInput };

export type MsgToClient = {
  t: "list/listed-puzzle";
  listed: ListPuzzlesOutput;
};

//
//
//
//
//

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0];

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>;

//
//
//
//

export type MsgGame =
  | {
      t: "listed-puzzles";
      input: ListPuzzlesInput;
      output: ListPuzzlesOutput;
    }
  | {
      t: "user-opened-puzzle";
      userId: UserId;
      puzzle: FlowPuzzle;
    };
