import type { GameServerModule } from "gamezilla-app/app/spaces/@shared/architecture/game-server-v2";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@shared/space-server-cmd";
import { Sub } from "gamezilla-app/@shared/core";
import type {
	MsgSync,
	ModelSync,
	ModelServer,
	MsgServer,
	MsgToClient,
	MsgToServer,
} from "./vs-user.core";

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
	ModelSync: ModelSync;
	MsgSync: MsgSync;
	Ctx: SpaceServerCtx;
	Deps: null;
	MsgInCmd: null;
	MsgInEvent: SpaceServerEvent;
	MsgOutCmd: SpaceServerCmd<MsgToClient>;
	MsgOutEvent: null;
}>;

export const init: Module["init"] = null;

export const update: Module["update"] = async (input) => {
	return { model: input.model };
};

export const subscriptions: Module["subscriptions"] = async (_input) => {
	return Sub.None;
};
