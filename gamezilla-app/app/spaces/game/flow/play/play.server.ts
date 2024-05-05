import type { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import { Sub } from "gamezilla-app/@/core";
import type {
	MsgCore,
	ModelCore,
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./play.core";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";

type Module = GameServerModule<{
	Model: ModelServer;
	Msg: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	MsgCore: MsgCore;
	ModelCore: ModelCore;
	Ctx: SpaceServerCtx;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
	Deps: null;
}>;

const init: Module["init"] = async () => {
	return {
		model: {},
	};
};

const update: Module["update"] = async (input) => {
	return {
		model: input.model,
	};
};

const subscriptions: Module["subscriptions"] = async () => {
	return Sub.None;
};

export const PlayServer: Module = {
	init,
	update,
	subscriptions,
	deps: async () => null,
};
