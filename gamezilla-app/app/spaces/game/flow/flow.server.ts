import { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import { Sub } from "gamezilla-app/@/core";
import { SpaceServerCmd } from "../../@/space-server-cmd";
import { CreateServer } from "./create/create.server";
import { CreateCore } from "./create/create.core";
import * as Play from "./play/play.types";
import { PlayServer } from "./play/play.server";
import type {
	ModelServer,
	ModelCore,
	MsgServer,
	MsgCore,
	MsgToClient,
	MsgToServer,
} from "./flow.types";

type ServerModule = GameServerModule<{
	Model: ModelServer;
	Msg: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: SpaceServerCtx;
	MsgEvtIn: SpaceServerEvent;
	MsgCmdOut: SpaceServerCmd<MsgToClient>;
}>;

const init: ServerModule["init"] = {
	t: "none",
};

const update: ServerModule["update"] = async (input) => {
	return GameServerModule.andThen(
		{ model: input.model },
		//
		(model) => updatePlay({ ...input, model }),
		(model) => updateCreate({ ...input, model }),
	);
};

const updateCreate: ServerModule["update"] = async (input) => {
	const updated = await CreateServer.update({
		ctx: input.ctx,
		modelCore:
			input.modelCore.t === "create"
				? input.modelCore.c
				: CreateCore.initCore({ ctx: input.ctx }),
		model: input.model.t === "create" ? input.model.c : CreateServer.init,
		msgCmd: input.msgCmd,
		msgEvt: input.msgEvt,
		msgClient:
			input.msgClient?.t === "create"
				? { ...input.msgClient, ...input.msgClient.c }
				: null,
		msgCore:
			input.msgCore?.t === "create"
				? { ...input.msgCore, ...input.msgCore.c }
				: null,
		msg: input.msg?.t === "create" ? input.msg.c : null,
		deps: await CreateServer.deps({
			ctx: input.ctx,
		}),
	});

	const tagged = GameServerModule.tagOutput(
		"create",
		(msgCmd) => SpaceServerCmd.tag("create", msgCmd),
		updated,
	);

	return tagged;
};

const updatePlay: ServerModule["update"] = async (input) => {
	const updated = await PlayServer.update({
		ctx: input.ctx,
		modelCore:
			input.modelCore.t === "play"
				? input.modelCore.c
				: Play.initCore({ ctx: input.ctx }),
		model: input.model.t === "play" ? input.model.c : PlayServer.init,
		msgCmd: input.msgCmd,
		msgEvt: input.msgEvt,
		msgClient:
			input.msgClient?.t === "play"
				? { ...input.msgClient, ...input.msgClient.c }
				: null,
		msgCore:
			input.msgCore?.t === "play"
				? { ...input.msgCore, ...input.msgCore.c }
				: null,
		msg: input.msg?.t === "play" ? input.msg.c : null,
		deps: null,
	});

	const tagged = GameServerModule.tagOutput(
		"play",
		(msgCmd) => SpaceServerCmd.tag("play", msgCmd),
		updated,
	);

	return tagged;
};

const subscriptions: ServerModule["subscriptions"] = async (input) => {
	const { modelCore } = input;

	switch (modelCore.t) {
		case "play": {
			return Sub.tag(
				"play",
				await PlayServer.subscriptions({
					ctx: input.ctx,
					modelCore: modelCore.c,
					model: input.model.t === "play" ? input.model.c : PlayServer.init,
				}),
			);
		}

		case "create": {
			return Sub.tag(
				"create",
				await CreateServer.subscriptions({
					ctx: input.ctx,
					modelCore: modelCore.c,
					model: input.model.t === "create" ? input.model.c : CreateServer.init,
				}),
			);
		}

		case null: {
			return Sub.None;
		}
	}
};

export const FlowServer: ServerModule = {
	init,
	subscriptions,
	update,
	async deps() {
		return null;
	},
};
