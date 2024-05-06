import { Sub } from "gamezilla-app/@/core";
import type { AppServerModule } from "../@/architecture/app-server";
import type { ServerCmd, ServerCtx, ServerEvent } from "../@/server";
import type { MsgServer, MsgToClient, MsgToServer } from "./lang.types";

type Module = AppServerModule<{
	Ctx: ServerCtx;
	Deps: null;
	Model: null;
	MsgToServer: MsgToServer;
	MsgToClient: MsgToClient;
	Msg: MsgServer;
	MsgCmdIn: null;
	MsgEvtIn: ServerEvent;
	MsgCmdOut: ServerCmd<MsgToClient>;
	MsgEvtOut: null;
}>;

export type Deps = null;

export const init: Module["init"] = async () => {
	return {
		model: null,
	};
};

export const update: Module["update"] = async ({ model }) => {
	return { model };
};

export const subscriptions: Module["subscriptions"] = async () => {
	return Sub.None;
};

export const getDeps: Module["getDeps"] = async () => {
	return null;
};
