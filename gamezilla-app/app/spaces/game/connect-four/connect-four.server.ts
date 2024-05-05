import { Sub } from "gamezilla-app/@/core";
import type { GameServerModule } from "../../@/architecture/game-server-v2";
import type { SpaceServerCtx, SpaceServerEvent } from "../../@/space";
import type { SpaceServerCmd } from "../../@/space-server-cmd";
import type {
	MsgCore,
	ModelCore,
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./connect-four.core";

//
//
//
//
//
//
//

type Module = GameServerModule<{
	Model: ModelServer;
	Msg: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
	Ctx: SpaceServerCtx;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
	Deps: null;
}>;

//
//
//
// Model
//
//
//

const init: Module["init"] = {
	t: null,
};

//
//
//
// Update
//
//
//

const update: Module["update"] = async (input) => {
	return {
		model: input.model,
	};
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = async (_input) => {
	return Sub.None;
};

export const ConnectFourServer: Module = {
	init,
	update,
	subscriptions,
	deps: async () => null,
};
