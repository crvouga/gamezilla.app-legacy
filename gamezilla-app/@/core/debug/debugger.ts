export type Global = typeof window;

export type DebugData<Model, Msg> = [DebugAction<Msg>, Model];

export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>;

export interface DebugInit {
	type: 'INIT';
}

export const debugInit = (): DebugInit => ({type: 'INIT'});

export interface DebugMsg<Msg> {
	type: 'MESSAGE';
	payload: Msg;
}

export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ({
	type: 'MESSAGE',
	payload,
});

export type MsgWithDebug<Model, Msg extends {}> =
	| Msg
	| {type: '__DebugUpdateModel__'; payload: Model}
	| {type: '__DebugApplyMsg__'; payload: Msg}
	| {type: '__DebugStarted__'};

export type Debug<Model, Msg extends {}> = (
	data: DebugData<Model, Msg>,
) => void;

export type Debugger<Model, Msg extends {}> = (d: DebuggerDeps<Model, Msg>) => {
	debug: Debug<Model, Msg>;
	stop: () => void;
};

export interface DebuggerDeps<Model, Msg extends {}> {
	init: Model;

	dispatch: (m: MsgWithDebug<Model, Msg>) => void;
}
