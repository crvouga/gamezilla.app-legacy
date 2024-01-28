import { IFlowPuzzleDb } from "../../../@SHARED/flow-puzzle-db";

//
//
//
//

export type ClientModel = {};

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
