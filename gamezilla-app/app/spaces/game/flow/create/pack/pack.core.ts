import type { FlowPack } from "../../@/flow-pack";
import type { FlowPackId } from "../../@/flow-pack/flow-pack-id";
import { PackBuilder } from "./builder";
import { PackCreate } from "./create";
import { PackList } from "./list";
import { RemovePuzzle } from "./remove-puzzle";

//
//
//
// Model
//
//
//

export type ModelClient = PackCreate.ModelClient &
	PackBuilder.ModelClient &
	PackList.ModelClient &
	RemovePuzzle.ModelClient;

export const initClient = (packs: {
	[packId: FlowPackId]: FlowPack;
}): ModelClient => {
	return {
		...PackBuilder.initClient,
		...PackCreate.initClient,
		...PackList.initClient,
		...RemovePuzzle.initClient(packs),
	};
};

//
//
//
// Msg
//
//
//

export type MsgClient =
	| PackCreate.MsgClient
	| PackBuilder.MsgClient
	| PackList.MsgClient
	| RemovePuzzle.MsgClient;

export type MsgServer =
	| PackCreate.MsgServer
	| PackBuilder.MsgServer
	| PackList.MsgServer;

export type MsgToServer =
	| PackCreate.MsgToServer
	| PackBuilder.MsgToServer
	| PackList.MsgToServer
	| RemovePuzzle.MsgToServer;

export type MsgToClient =
	| PackCreate.MsgToClient
	| PackBuilder.MsgToClient
	| PackList.MsgToClient
	| RemovePuzzle.MsgToClient;

//
//
//
//
//
//
//

export type ModelSync = RemovePuzzle.ModelSync;

export type MsgSync =
	| PackCreate.MsgSync
	| PackBuilder.MsgSync
	| PackList.MsgSync
	| RemovePuzzle.MsgSync;
