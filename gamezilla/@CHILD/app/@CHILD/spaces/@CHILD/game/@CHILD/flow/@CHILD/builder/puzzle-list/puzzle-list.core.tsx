import { RemoteResult } from "gamezilla/@SHARED/core";
import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";

//
//
//
//

export type ClientModel = {
  puzzleListRequest: RemoteResult<string, null>;
};

export type ClientMsg = { t: "list/user-observed-end-of-list" };

export type ServerMsg = { t: "noop" };

export type ToServer = { t: "list/list-puzzles"; input: ListPuzzlesInput };

export type ToClient = { t: "list/listed-puzzle"; listed: ListPuzzlesOutput };

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

export type GameEvent = {
  t: "listed-puzzles";
  input: ListPuzzlesInput;
  output: ListPuzzlesOutput;
};
