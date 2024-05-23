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
import { ListTabs } from "./list-tabs";
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
	MsgCmdOut: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtIn: SpaceClientEvent;
}>;

export type ServerModule = GameServerModule<{
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: SpaceServerCtx;
	MsgEvtIn: SpaceServerEvent;
	Model: ModelServer;
	Msg: MsgServer;
	MsgCmdOut: SpaceServerCmd<MsgToClient>;
	Deps: FlowServerDeps;
}>;

export type FlowServerDeps = {
	flowPuzzleDb: IFlowPuzzleDb;
	flowPackDb: IFlowPackDb;
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
	...PuzzleTypes.initClient(),
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

export const MsgCore = p.or(
	ListTabs.MsgCore,
	PuzzleTypes.MsgCore,
	PackTypes.MsgCore,
);
export type MsgCore = p.Infer<typeof MsgCore>;

const Open = p.or(
	p.obj({ t: p.l("list") }),
	p.obj({ t: p.l("puzzle-builder") }),
	p.obj({ t: p.l("pack-builder") }),
);
type Open = p.Infer<typeof Open>;

export const BaseModelCore = p.obj({
	opened: Open,
});
type BaseModelCore = p.Infer<typeof BaseModelCore>;

export const ModelCore = p.and(
	BaseModelCore,
	PuzzleTypes.ModelCore,
	PackTypes.ModelCore,
	ListTabs.ModelCore,
);
export type ModelCore = p.Infer<typeof ModelCore>;

export type UpdateCore = (input: {
	ctx: SpaceCtx;
	msgCore: MsgCore;
	modelCore: ModelCore;
}) => ModelCore;
