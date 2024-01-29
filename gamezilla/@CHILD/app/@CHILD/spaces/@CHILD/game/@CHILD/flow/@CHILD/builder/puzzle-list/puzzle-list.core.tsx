import { RemoteResult } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";

//
//
//
//

export type ClientModel = {
  puzzleListRequest: RemoteResult<string, null>;
};

export type ClientMsg =
  | { t: "list/user-observed-end-of-list" }
  | { t: "list/user-clicked-puzzle-list-item"; puzzle: FlowPuzzle };

export type ServerMsg = { t: "noop" };

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

export type MsgGame = {
  t: "listed-puzzles";
  input: ListPuzzlesInput;
  output: ListPuzzlesOutput;
};
