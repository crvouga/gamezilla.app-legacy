import { Sub } from "gamezilla-app/@/core";
import type { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import type {
	ModelCore,
	ModelServer,
	MsgCore,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./play.types";

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

const init: ServerModule["init"] = async () => {
	return {
		model: {},
	};
};

const update: ServerModule["update"] = async (input) => {
	return {
		model: input.model,
	};
};

const subscriptions: ServerModule["subscriptions"] = async () => {
	return Sub.None;
};

export const PlayServer: ServerModule = {
	init,
	update,
	subscriptions,
	deps: async () => null,
};
