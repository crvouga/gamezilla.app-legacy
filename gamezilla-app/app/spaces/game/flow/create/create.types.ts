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
import { Pack } from "./pack";
import type { PackBuilder } from "./pack/builder";
import { PuzzleBuilder } from "./puzzle/builder";
import { PuzzleCreate } from "./puzzle/create";
import { PuzzleDeleteForever } from "./puzzle/delete-forever";
import { PuzzleEditName } from "./puzzle/edit";
import { PuzzleList } from "./puzzle/list";
import type { PuzzleSaveChanges } from "./puzzle/save-changes";
import { p } from "gamezilla-app/@/core/parser";

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
	//
	PuzzleCreate.ModelClient &
	PuzzleList.ModelClient &
	PuzzleSaveChanges.ModelClient &
	PuzzleEditName.ModelClient &
	PuzzleDeleteForever.ModelClient &
	//
	Pack.ModelClient;

export const initClient: ClientModule["init"] = {
	...Pack.initClient({}),
	//
	...PuzzleBuilder.initClient,
	...PuzzleCreate.initClient,
	...PuzzleList.initClient,
	...PuzzleEditName.initClient,
	...PuzzleDeleteForever.initClient,
	//
	flowPuzzleList: FlowPuzzleList.initClient,
	flowPackList: FlowPackList.initClient,
	//
	packs: {},
	puzzles: {},
	//
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
	//
	| BaseMsgClient
	| ListTabs.MsgClient
	//
	| PuzzleBuilder.MsgClient
	| PuzzleCreate.MsgClient
	| PuzzleEditName.MsgClient
	| PuzzleDeleteForever.MsgClient
	| PuzzleList.MsgClient
	| PuzzleSaveChanges.MsgClient
	//
	| Pack.MsgClient;

export type MsgServer =
	//
	| { t: "flow-pack-list"; c: FlowPackList.MsgServer }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgServer }
	//
	| PuzzleCreate.MsgServer
	| PuzzleSaveChanges.MsgServer
	| PuzzleDeleteForever.MsgServer
	| PuzzleList.MsgServer
	| PuzzleEditName.MsgServer
	//
	| Pack.MsgServer;

export type MsgToServer =
	//
	| { t: "flow-pack-list"; c: FlowPackList.MsgToServer }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToServer }
	//
	| PuzzleCreate.MsgToServer
	| PuzzleSaveChanges.MsgToServer
	| PuzzleDeleteForever.MsgToServer
	| PuzzleEditName.MsgToServer
	| PuzzleList.MsgToServer
	//
	| Pack.MsgToServer;

export type MsgToClient =
	//
	| { t: "flow-pack-list"; c: FlowPackList.MsgToClient }
	| { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToClient }
	//
	| PuzzleCreate.MsgToClient
	| PuzzleSaveChanges.MsgToClient
	| PuzzleEditName.MsgToClient
	| PuzzleDeleteForever.MsgToClient
	| PuzzleList.MsgToClient
	//
	| Pack.MsgToClient;

//
//
//
//
//
//
//

export type MsgCore =
	| ListTabs.MsgCore
	//
	| Pack.MsgCore
	//
	| PuzzleBuilder.MsgCore
	| PuzzleList.MsgCore
	| PuzzleCreate.MsgCore
	| PuzzleEditName.MsgCore
	| PuzzleDeleteForever.MsgCore
	| PuzzleSaveChanges.MsgCore;

export type ModelCore = Pack.ModelCore &
	ListTabs.ModelCore & {
		opened: { t: "list" } | { t: "puzzle-builder" } | { t: "pack-builder" };
		//
		packBuilder: PackBuilder.ModelCore | null;
		//
		puzzleBuilder: PuzzleBuilder.ModelCore | null;
	};

export type UpdateCore = (input: {
	ctx: SpaceCtx;
	msgCore: MsgCore;
	modelCore: ModelCore;
}) => ModelCore;
