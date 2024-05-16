import { PackCreateNew } from "./pack-create-new";
import { PackList } from "./pack-list";
import { PackBuilder } from "./pack-builder";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
// Model
//
//
//

type BaseModelClient = {};

export type ModelClient = BaseModelClient &
	PackCreateNew.ModelClient &
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

export type MsgServer = PackCreateNew.MsgServer | PackBuilder.MsgServer;

export type MsgToServer = PackCreateNew.MsgToServer | PackBuilder.MsgToServer;

export type MsgToClient = PackCreateNew.MsgToClient | PackBuilder.MsgToClient;

//
//
//
//
//
//
//

export const ModelCore = p.obj({
	packBuilder: p.or(PackBuilder.ModelCore, p.l(null)),
});

export type ModelCore = p.Infer<typeof ModelCore>;

export const MsgCore = p.or(
	PackCreateNew.MsgCore,
	PackBuilder.MsgCore,
	PackList.MsgCore,
);
export type MsgCore = p.Infer<typeof MsgCore>;
