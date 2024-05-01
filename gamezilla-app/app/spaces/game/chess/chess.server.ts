import { Sub } from "gamezilla-app/@/core";
import type { GameServer } from "gamezilla-app/app/spaces/@/architecture/game-server";
import type {
	ModelServer,
	ModelSync,
	MsgServer,
	MsgSync,
	MsgToClient,
	MsgToServer,
} from "./chess.core";

//
//
//
//
//
//
//

type Server = GameServer<{
	MsgSync: MsgSync;
	ModelSync: ModelSync;
	ModelServer: ModelServer;
	MsgServer: MsgServer;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
	if (input.model) {
		return { model: input.model };
	}
	return {
		model: { t: "none" },
	};
};

//
//
//
// Update
//
//
//

export const update: Server["update"] = async (_input) => {
	return {
		model: {
			t: "none",
		},
	};
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (_input) => {
	return Sub.None;
};
