import { PackCreateNew } from "./pack-create-new";
import { PackList } from "./pack-list";
import { PackBuilder } from "./pack-builder";

//
//
//
// Model
//
//
//

export type ModelClient = PackCreateNew.ModelClient &
	PackBuilder.ModelClient &
	PackList.ModelClient;

export const initClient = (): ModelClient => {
	return {
		...PackBuilder.initClient,
		...PackCreateNew.initClient,
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
	| PackCreateNew.MsgClient
	| PackBuilder.MsgClient
	| PackList.MsgClient;

export type MsgServer =
	| PackCreateNew.MsgServer
	| PackBuilder.MsgServer
	| PackList.MsgServer;

export type MsgToServer =
	| PackCreateNew.MsgToServer
	| PackBuilder.MsgToServer
	| PackList.MsgToServer;

export type MsgToClient =
	| PackCreateNew.MsgToClient
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
	| PackCreateNew.MsgCore
	| PackBuilder.MsgCore
	| PackList.MsgCore;
