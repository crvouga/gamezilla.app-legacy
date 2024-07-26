import type * as Auth from './auth/auth.types';
import type * as Lang from './lang/lang.types';
import type * as Profile from './profile/profile.types';
import type * as Spaces from './spaces/spaces.types';
import type * as Wire from './wire/wire.types';
import type {ClientId, SessionId, UserId} from './@/data';
import type {Platform, Routing, Sound, StatusBar, Toast} from './app-client';

//
//
//
// Model
//
//
//

export type ModelServer = null;

export type ModelClient = {
	auth: Auth.ModelClient;
	spaces: Spaces.ModelClient;
	profile: Profile.ModelClient;
	wire: Wire.ModelClient;
	lang: Lang.ModelClient;
	routing: Routing.Model;
	toast: Toast.Model;
	sound: Sound.Model;
	platform: Platform.Model;
	statusBar: StatusBar.Model;
};

//
//
//
// Msg
//
//
//

export type MsgServer =
	| ({t: '→'; c: MsgToServer} & MsgToServerMeta)
	| {t: 'wire'; c: Wire.MsgServer}
	| {t: 'spaces'; c: Spaces.MsgServer}
	| {t: 'profile'; c: Profile.MsgServer}
	| {t: 'auth'; c: Auth.MsgServer}
	| {t: 'lang'; c: Lang.MsgServer};

export type MsgClient =
	| {t: '→'; c: MsgToClient}
	| {t: 'routing'; c: Routing.Msg}
	| {t: 'toast'; c: Toast.Msg}
	| {t: 'sound'; c: Sound.Msg}
	| {t: 'platform'; c: Platform.Msg}
	| {t: 'status-bar'; c: StatusBar.Msg}
	| {t: 'wire'; c: Wire.MsgClient}
	| {t: 'spaces'; c: Spaces.MsgClient}
	| {t: 'auth'; c: Auth.MsgClient}
	| {t: 'profile'; c: Profile.MsgClient}
	| {t: 'lang'; c: Lang.MsgClient};

export type MsgToServer =
	| {t: 'spaces'; c: Spaces.MsgToServer}
	| {t: 'auth'; c: Auth.MsgToServer}
	| {t: 'profile'; c: Profile.MsgToServer}
	| {t: 'wire'; c: Wire.MsgToServer}
	| {t: 'lang'; c: Lang.MsgToServer};

export type MsgToClient =
	| {t: 'spaces'; c: Spaces.MsgToClient}
	| {t: 'auth'; c: Auth.MsgToClient}
	| {t: 'profile'; c: Profile.MsgToClient}
	| {t: 'wire'; c: Wire.MsgToClient}
	| {t: 'lang'; c: Lang.MsgToClient};

//
//
//

export type MsgToServerMeta = {
	sessionId: SessionId;
	clientId: ClientId;
	userId?: UserId | null;
};
