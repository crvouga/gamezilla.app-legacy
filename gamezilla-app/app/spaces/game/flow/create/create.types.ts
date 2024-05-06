import { p } from "gamezilla-app/@/core/parser";
import type { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import type { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type {
	SpaceClientEvent,
	SpaceCtx,
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceClientCmd } from "gamezilla-app/app/spaces/@/space-client-cmd";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import type { FlowClientCtx } from "../@/flow-ctx";
import type { FlowPack } from "../@/flow-pack/flow-pack";
import type { IFlowPackDb } from "../@/flow-pack/flow-pack-db";
import { FlowPackList } from "../@/flow-pack/flow-pack-list";
import type { FlowPuzzle } from "../@/flow-puzzle/flow-puzzle";
import type { IFlowPuzzleDb } from "../@/flow-puzzle/flow-puzzle-db/flow-puzzle-db";
import type { FlowPuzzleId } from "../@/flow-puzzle/flow-puzzle-id";
import { FlowPuzzleList } from "../@/flow-puzzle/flow-puzzle-list";
import type { ListTabs } from "./list-tabs";
import { PackTypes } from "./pack";
import { PuzzleTypes } from "./puzzle";

//
//
//
//
//
//
//
//

export type ClientModule = GameClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: FlowClientCtx;
	MsgOutCmd: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgInEvent: SpaceClientEvent;
	MsgInCmd: null;
	MsgOutEvent: null;
}>;

export type ServerModule = GameServerModule<{
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: SpaceServerCtx;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	Model: ModelServer;
	Msg: MsgServer;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
	Deps: FlowServerDeps;
}>;

export type FlowServerDeps = {
	FlowPuzzleDb: IFlowPuzzleDb;
	FlowPackDb: IFlowPackDb;
};

//
//
//
// Model
//
//
//

type BaseModelClient = {
	puzzles: {
		[puzzleId: FlowPuzzleId]: FlowPuzzle;
	};
	packs: {
		[packId: string]: FlowPack;
	};
	flowPuzzleList: FlowPuzzleList.ModelClient;
	flowPackList: FlowPackList.ModelClient;
	puzzleBuilderOpened?:
		| "more"
		| "edit-name"
		| "delete-forever"
		| "unsaved-changes"
		| null;
};

export type ModelClient = BaseModelClient &
	PuzzleTypes.ModelClient &
	PackTypes.ModelClient;

export const initClient: ClientModule["init"] = {
	...PackTypes.initClient(),
	...PuzzleTypes.initClient,
	flowPuzzleList: FlowPuzzleList.initClient,
	flowPackList: FlowPackList.initClient,
	packs: {},
	puzzles: {},
};

export const ModelServer = p.obj({
	flowPackList: FlowPackList.ModelServer,
});
export type ModelServer = p.Infer<typeof ModelServer>;

export const initServer: ServerModule["init"] = {
	flowPackList: FlowPackList.initServer,
};

//
//
//
// Msg
//
//
//

type BaseMsgClient = { t: "time-passed" };

//

export type MsgClient =
	| { t: "flow-pack-list"; c: FlowPackList.MsgClient }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgClient }
	| BaseMsgClient
	| ListTabs.MsgClient
	| PuzzleTypes.MsgClient
	| PackTypes.MsgClient;

export type MsgServer =
	| { t: "flow-pack-list"; c: FlowPackList.MsgServer }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgServer }
	| PuzzleTypes.MsgServer
	| PackTypes.MsgServer;

export type MsgToServer =
	| { t: "flow-pack-list"; c: FlowPackList.MsgToServer }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToServer }
	| PuzzleTypes.MsgToServer
	| PackTypes.MsgToServer;

export type MsgToClient =
	| { t: "flow-pack-list"; c: FlowPackList.MsgToClient }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToClient }
	| PuzzleTypes.MsgToClient
	| PackTypes.MsgToClient;

//
//
//
//
//
//
//

export type MsgCore =
	| ListTabs.MsgCore
	| PackTypes.MsgCore
	| PuzzleTypes.MsgCore;

type BaseModelCore = {
	opened: { t: "list" } | { t: "puzzle-builder" } | { t: "pack-builder" };
};

export type ModelCore = PuzzleTypes.ModelCore &
	PackTypes.ModelCore &
	ListTabs.ModelCore &
	BaseModelCore;

export type UpdateCore = (input: {
	ctx: SpaceCtx;
	msgCore: MsgCore;
	modelCore: ModelCore;
}) => ModelCore;
