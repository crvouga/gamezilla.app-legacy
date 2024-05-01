import { RequestResponse } from "gamezilla-app/@/core";
import type { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import type { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import type {
	SpaceClientCtx,
	SpaceClientEvent,
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import type { FlowPuzzle } from "../flow-puzzle";
import type {
	IFlowPuzzleDb,
	ListPuzzlesInput,
	ListPuzzlesOutput,
} from "../flow-puzzle-db";
import type { FlowPuzzleId } from "../flow-puzzle-id";

//
//
//
//
//

export type ClientModule = AppClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: SpaceClientCtx;
	MsgInCmd: never;
	MsgInEvent: SpaceClientEvent;
	MsgOutCmd: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgOutEvent: SpaceClientEvent;
	ViewSlot: {
		fab: null;
	};
	ViewEmit: {
		clickedPuzzleItem: FlowPuzzle;
	};
}>;

export type ServerModule = AppServerModule<{
	Deps: {
		FlowPuzzleDb: IFlowPuzzleDb;
	};
	Model: ModelServer;
	Msg: MsgServer;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: never;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: SpaceServerCtx;
	MsgInCmd: never;
	MsgInEvent: SpaceServerEvent;
}>;

//
//
//
//

export type ModelClient = {
	request: RequestResponse<string, null>;
	puzzles: { [id: FlowPuzzleId]: FlowPuzzle };
};

export const initClient: ModelClient = {
	request: RequestResponse.notAsked,
	puzzles: {},
};

export type ModelServer = null;

export type MsgClient =
	| { t: "flow-puzzle-list.user-observed-end-of-list" }
	| { t: "flow-puzzle-list.elasped" };

export type MsgServer = { t: "flow-puzzle-list.noop" };

export type MsgToServer = {
	t: "flow-puzzle-list.list-puzzles";
	input: ListPuzzlesInput;
};

export type MsgToClient = {
	t: "flow-puzzle-list.listed-puzzle";
	listed: ListPuzzlesOutput;
};
