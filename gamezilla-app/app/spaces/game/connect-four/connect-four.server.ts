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
} from "./connect-four.types";

//
//
//
//
//
//
//

type ServerModule = GameServerModule<{
	Model: ModelServer;
	Msg: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	ModelCore: ModelCore;
	MsgCore: MsgCore;
	Ctx: SpaceServerCtx;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
}>;

//
//
//
// Model
//
//
//

const init: ServerModule["init"] = {
	t: null,
};

//
//
//
// Update
//
//
//

const update: ServerModule["update"] = async (input) => {
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

const subscriptions: ServerModule["subscriptions"] = async (_input) => {
	return Sub.None;
};

export const ConnectFourServer: ServerModule = {
	init,
	update,
	subscriptions,
	deps: async () => null,
};
