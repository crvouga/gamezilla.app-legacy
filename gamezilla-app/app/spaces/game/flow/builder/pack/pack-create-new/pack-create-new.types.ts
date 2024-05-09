import { UserId } from "gamezilla-app/app/@/data";
import { type RemoteResult, Result, NotAsked } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { FlowPack } from "../../../@/flow-pack/flow-pack";

//
//
//
//
//

export type ModelClient = {
	packCreateNewRequest: RemoteResult<string, null>;
};

export const initClient: ModelClient = {
	packCreateNewRequest: NotAsked,
};

export type ModelServer = {};

//
//
//
//

export type MsgClient = {
	t: "pack-create-new.clicked-create-button";
};

export type MsgToServer = { t: "pack-create-new.clicked-create-button" };

export type MsgServer = {
	t: "noop";
};

export type MsgToClient = {
	t: "pack-create-new.created-pack";
	created: Result<string, FlowPack>;
};

//
//
//
//
//

export const MsgCore = p.obj({
	t: p.l("user-created-pack"),
	created: Result.parser(p.str, FlowPack.parser),
	userId: UserId,
});

export type MsgCore = p.Infer<typeof MsgCore>;
