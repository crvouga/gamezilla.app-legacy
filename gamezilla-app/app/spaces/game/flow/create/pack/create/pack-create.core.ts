import { UserId } from "gamezilla-app/app/@/data";
import {
	type RemoteResult,
	Result,
	notAsked,
} from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { FlowPack } from "../../../@/flow-pack/flow-pack";

//
//
//
//
//

export type ModelClient = {
	packCreateRequest: RemoteResult<string, null>;
};

export const initClient: ModelClient = {
	packCreateRequest: notAsked,
};

export type ModelServer = {};

//
//
//
//

export type MsgClient = {
	t: "pack-create.clicked-create-button";
};

export type MsgToServer = { t: "pack-create.clicked-create-button" };

export type MsgServer = {
	t: "noop";
};

export type MsgToClient = {
	t: "pack-create.created-pack";
	created: Result<string, FlowPack>;
};

//
//
//
//
//

export const isMsgSync = p.obj({
	t: p.l("user-created-pack"),
	created: p.custom(
		Result.is(p.is(p.str), p.is(FlowPack.parser)),
		"Invalid result",
	),
	userId: UserId,
});

export type MsgSync = p.Infer<typeof isMsgSync>;
