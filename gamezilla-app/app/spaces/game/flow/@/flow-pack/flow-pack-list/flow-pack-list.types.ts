import {RemoteResult, type RequestResponse} from 'gamezilla-app/@/core';
import {p} from 'gamezilla-app/@/core/parser';
import type {AppClientModule} from 'gamezilla-app/app/@/architecture/app-client';
import type {AppServerModule} from 'gamezilla-app/app/@/architecture/app-server';
import type {
	SpaceClientCtx,
	SpaceClientEvent,
	SpaceServerCtx,
	SpaceServerEvent,
} from 'gamezilla-app/app/spaces/@/space';
import type {SpaceClientCmd} from 'gamezilla-app/app/spaces/@/space-client-cmd';
import type {SpaceServerCmd} from 'gamezilla-app/app/spaces/@/space-server-cmd';
import type {FlowPack} from '../flow-pack';
import type {IFlowPackDb} from '../flow-pack-db';
import type {FlowPackId} from '../flow-pack-id';

//
//
//
//
//

export type ClientModule = AppClientModule<{
	Model: ModelClient;
	Msg: MsgClient;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: SpaceClientCtx;
	MsgEvtIn: SpaceClientEvent;
	MsgCmdOut: SpaceClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgEvtOut: SpaceClientEvent;
	ViewSlot: {
		fab: null;
	};
	ViewEmit: {
		clickedPackItem: FlowPack;
	};
}>;

export type ServerModule = AppServerModule<{
	Deps: {
		flowPackDb: IFlowPackDb;
	};
	Model: ModelServer;
	Msg: MsgServer;
	MsgCmdOut: SpaceServerCmd<MsgToClient>;
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
	Ctx: SpaceServerCtx;
	MsgEvtIn: SpaceServerEvent;
}>;

//
//
//
//

export type ModelClient = {
	request: RequestResponse<string, null>;
	packs: {[id: FlowPackId]: FlowPack};
};

export const initClient: ModelClient = {
	request: RemoteResult.NotAsked,
	packs: {},
};

export const ModelServer = p.l(null);
export type ModelServer = p.Infer<typeof ModelServer>;

export const initServer: ModelServer = null;

export const MsgClient = p.or(
	p.obj({t: p.l('user-observed-end-of-list')}),
	p.obj({t: p.l('elapsed')}),
);
export type MsgClient = p.Infer<typeof MsgClient>;

export type MsgServer = {t: 'noop'};

export type MsgToServer = {
	t: 'list-packs';
	input: ListPackInput;
};

export const MsgToClient = p.obj({
	t: p.l('listed-packs'),
	listed: p.custom(
		(x: unknown): x is ListPackOutput => Boolean(x),
		'ListPackOutput',
	),
});

export type MsgToClient = {
	t: 'listed-packs';
	listed: ListPackOutput;
};

export type ListPackInput = Parameters<IFlowPackDb['list']>[0];

export type ListPackOutput = Awaited<ReturnType<IFlowPackDb['list']>>;
