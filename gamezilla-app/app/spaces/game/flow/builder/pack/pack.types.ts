import { PackCreateNew } from "./create-new-pack";
import { ScreenOpenPackTypes } from "./screen-open-pack";
import { PackBuilder } from "./screen-pack-builder";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
// Model
//
//
//

export type ModelClient = PackCreateNew.ModelClient &
	PackBuilder.ModelClient &
	ScreenOpenPackTypes.ModelClient;

export const initClient = (): ModelClient => {
	return {
		...PackBuilder.initClient,
		...PackCreateNew.initClient,
		...ScreenOpenPackTypes.initClient,
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
	| ScreenOpenPackTypes.MsgClient;

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
	packBuilder: p.maybe(PackBuilder.ModelCore),
});

export type ModelCore = p.Infer<typeof ModelCore>;

export const MsgCore = p.or(
	PackCreateNew.MsgCore,
	PackBuilder.MsgCore,
	ScreenOpenPackTypes.MsgCore,
);
export type MsgCore = p.Infer<typeof MsgCore>;
