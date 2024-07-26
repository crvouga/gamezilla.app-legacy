import {Err, type Result} from 'gamezilla-app/@/core';
import type {GameMainMenu} from '../@/game';
import type * as VsBot from './vs-bot/vs-bot.types';
import type * as VsUser from './vs-user/vs-user.types';

//
//
//
// Model
//
//
//

export type ModelClient =
	| {t: 'none'}
	| {t: 'vs-user'; c: VsUser.ModelClient}
	| {t: 'vs-bot'; c: VsBot.ModelClient};

export type ModelServer =
	| {t: 'none'}
	| {t: 'vs-user'; c: VsUser.ModelServer}
	| {t: 'vs-bot'; c: VsBot.ModelServer};

export const parseModel = (): Result<string, ModelServer> => {
	return Err('Unimplemented');
};

//
//
//
// Msg
//
//
//

export type MsgClient =
	| GameMainMenu.Msg
	| {t: 'vs-user'; c: VsUser.MsgClient}
	| {t: 'vs-bot'; c: VsBot.MsgClient}
	| Req;

export type MsgServer =
	| {t: 'vs-user'; c: VsUser.MsgServer}
	| {t: 'vs-bot'; c: VsBot.MsgServer};

export type MsgToServer =
	| {t: 'vs-user'; c: VsUser.MsgToServer}
	| {t: 'vs-bot'; c: VsBot.MsgToServer}
	| Req;

export type MsgToClient =
	| {t: 'vs-user'; c: VsUser.MsgToClient}
	| {t: 'vs-bot'; c: VsBot.MsgToClient}
	| Res;

export type Req = {
	t: 'input-mode';
	mode: ModelServer['t'];
};

export type Res = Req & {
	result: Result<Problem, ModelServer>;
};

type Problem = 'must-be-host';
