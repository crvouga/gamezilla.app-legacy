import {p} from 'gamezilla-app/@/core/parser';
import * as ConnectFour from './connect-four/connect-four.types';
import * as Flow from './flow/flow.types';
//
//
//
// Model
//
//
//

export type ModelClient =
	| {t: 'connect-four'; c: ConnectFour.ModelClient}
	| {t: 'flow'; c: Flow.ModelClient};

export const ModelServer = p.or(
	p.obj({
		t: p.l('connect-four'),
		c: ConnectFour.ModelServer,
	}),
	p.obj({
		t: p.l('flow'),
		c: Flow.ModelServer,
	}),
);
export type ModelServer = p.Infer<typeof ModelServer>;

//
//
//
// Msg
//
//
//

export type MsgServer =
	| {t: 'connect-four'; c: ConnectFour.MsgServer}
	| {t: 'flow'; c: Flow.MsgServer};

export type MsgClient =
	| {t: 'connect-four'; c: ConnectFour.MsgClient}
	| {t: 'flow'; c: Flow.MsgClient};

export type MsgToClient =
	| {t: 'connect-four'; c: ConnectFour.MsgToClient}
	| {t: 'flow'; c: Flow.MsgToClient};

export type MsgToServer =
	| {t: 'connect-four'; c: ConnectFour.MsgToServer}
	| {t: 'flow'; c: Flow.MsgToServer};

//
//
//
// Game Name
//
//
//

export const GAME_NAME = [
	'connect-four',
	'flow',
	'tic-tac-toe',
	'gomoku',
	'chess',
] as const;

export const GameName = p.enumeration(GAME_NAME);

export type GameName = p.Infer<typeof GameName>;

export const gameNames: {[gameName in GameName]: GameName} = {
	'connect-four': 'connect-four',
	'flow': 'flow',
	'tic-tac-toe': 'tic-tac-toe',
	'gomoku': 'gomoku',
	'chess': 'chess',
};

export const isGameName = (x: unknown): x is GameName => {
	return (
		typeof x === 'string' &&
		Object.keys(gameNames).includes(x)
	);
};

export const gameNameList: GameName[] = [
	// "connect-four",
	'flow',
];

export const ModelCore = p.or(
	p.obj({
		t: p.l('connect-four'),
		c: ConnectFour.ModelCore,
	}),
	p.obj({
		t: p.l('flow'),
		c: Flow.ModelCore,
	}),
);
export type ModelCore = p.Infer<typeof ModelCore>;

export const MsgCore = p.or(
	p.obj({
		t: p.l('connect-four'),
		c: ConnectFour.MsgCore,
	}),
	p.obj({
		t: p.l('flow'),
		c: Flow.MsgCore,
	}),
);
export type MsgCore = p.Infer<typeof MsgCore>;
