import { Sub } from "gamezilla-app/@/core";
import type { GameServerModule } from "gamezilla-app/app/spaces/@/architecture/game-server-v2";
import type {
	SpaceServerCtx,
	SpaceServerEvent,
} from "gamezilla-app/app/spaces/@/space";
import type { SpaceServerCmd } from "gamezilla-app/app/spaces/@/space-server-cmd";
import { FlowPackDb, FlowPackListServer, IFlowPackDb } from "../@/flow-pack";
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
	Deps: {
		flowPackDb: IFlowPackDb;
	}
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

export const updateFlowPackList: ServerModule["update"] = async (input) => {
	const updated = FlowPackListServer.update({
		ctx: input.ctx,
		deps: input.deps,
		model: null,
		msg: input.msg?.t === "flow-pack-list" ? input.msg.c : null,
		msgClient: input.msgClient?.t === 'flow-pack-list' ? {...input.msgClient, ...input.msgClient.c} : null,
		msgCmd: input.msgCmd,
		msgEvt: input.msgEvt,
	})
	updated
	return {
		model: input.model,
		
	}
}

const subscriptions: ServerModule["subscriptions"] = async () => {
	return Sub.None;
};

export const PlayServer: ServerModule = {
	init,
	update,
	subscriptions,
	deps: async (input) => {
		return {
			flowPackDb: FlowPackDb({
				t: 'db-conn-sql',
				dbConnSql: input.ctx.dbConnSql,
			})
		}
	},
};
