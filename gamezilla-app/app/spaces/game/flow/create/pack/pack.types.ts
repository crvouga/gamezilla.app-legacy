import { PackCreate } from "./create";
import { PackList } from "./list";
import { PackBuilder } from "./pack-builder";

//
//
//
// Model
//
//
//

export type ModelClient = PackCreate.ModelClient &
	PackBuilder.ModelClient &
	PackList.ModelClient;

export const initClient = (): ModelClient => {
	return {
		...PackBuilder.initClient,
		...PackCreate.initClient,
		...PackList.initClient,
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
	| PackList.MsgClient;

export type MsgServer =
	| PackCreate.MsgServer
	| PackBuilder.MsgServer
	| PackList.MsgServer;

export type MsgToServer =
	| PackCreate.MsgToServer
	| PackBuilder.MsgToServer
	| PackList.MsgToServer;

export type MsgToClient =
	| PackCreate.MsgToClient
	| PackBuilder.MsgToClient
	| PackList.MsgToClient;

//
//
//
//
//
//
//

export type ModelCore = {
	packBuilder: PackBuilder.ModelCore | null;
};

export type MsgCore =
	| PackCreate.MsgCore
	| PackBuilder.MsgCore
	| PackList.MsgCore;
