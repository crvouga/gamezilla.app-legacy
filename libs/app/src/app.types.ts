import * as Auth from '@gamezilla/feat/auth';
import * as Chat from '@gamezilla/feat/chat';
import * as Profile from '@gamezilla/feat/profile';
import * as Room from '@gamezilla/feat/room';
import * as Search from '@gamezilla/feat/search';
import { ClientId, SessionId, UserId } from '@gamezilla/shared/app';
import { Alerts, Route } from '@gamezilla/shared/frontend';

//
//
//
// Model
//
//
//

export type BackendModel = {
  room: Room.BackendModel;
  sessions: {
    [sessionId: SessionId]: Session;
  };
  profile: Profile.ServerModel;
  search: Search.BackendModel;
  chat: Chat.BackendModel;
  auth: Auth.BackendModel;
};

export type Session = {
  sessionId: SessionId;
  userId?: UserId;
  clientId?: ClientId;
};

export type FrontendModel = {
  route: Route.Route;
  alerts: Alerts.Model<FrontendMsg>;
  wire: WireModel;
  auth: Auth.FrontendModel;
  room: Room.FrontendModel;
  profile: Profile.ServerModel;
  chat: Chat.FrontendModel;
  search: Search.FrontendModel;
};

export type WireModel =
  | { type: 'connecting' }
  | { type: 'connect-error'; errorCount: number }
  | { type: 'disconnected' }
  | { type: 'connected' };

//
//
//
// Msg
//
//
//

export type ToBackend =
  | { t: 'room'; c: Room.ToBackend }
  | { t: 'auth'; c: Auth.ToBackend }
  | { t: 'profile'; c: Profile.ToServer }
  | { t: 'search'; c: Search.ToBackend }
  | { t: 'chat'; c: Chat.ToBackend }
  | { t: 'auth'; c: Auth.ToBackend };

export type ToFrontend =
  | { t: 'room'; c: Room.ToFrontend }
  | { t: 'profile'; c: Profile.ToClient }
  | { t: 'search'; c: Search.ToFrontend }
  | { t: 'chat'; c: Chat.ToFrontend }
  | { t: 'auth'; c: Auth.ToFrontend }
  | { t: 'access-denied'; msg: ToBackend };

export type FrontendMsg =
  | { t: '→'; c: ToFrontend }
  | { t: 'wire'; wire: WireModel['type'] }
  | { t: 'route'; c: Route.Msg }
  | { t: 'alerts'; c: Alerts.Msg }
  | { t: 'room'; c: Room.FrontendMsg }
  | { t: 'chat'; c: Chat.FrontendMsg }
  | { t: 'auth'; c: Auth.FrontendMsg }
  | { t: 'profile'; c: Profile.ClientMsg }
  | { t: 'search'; c: Search.FrontendMsg };

export type BackendMsg =
  | { t: '→'; sessionId: SessionId; clientId: ClientId; c: ToBackend }
  | { t: 'client-connected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'client-disconnected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'room'; c: Room.BackendMsg }
  | { t: 'profile'; c: Profile.ServerMsg }
  | { t: 'search'; c: Search.BackendMsg }
  | { t: 'chat'; c: Chat.BackendMsg }
  | { t: 'auth'; c: Auth.BackendMsg };

//
//
//
// Transport
//
//
//

export type ServerToClientEvents = {
  ['to-client']: (msg: ToFrontend) => void;
  ['session-id']: (sessionId: SessionId) => void;
};

export type ClientToServerEvents = {
  ['to-server']: (msg: ToBackend) => void;
};

export const backendServerPort = 5000;

export const sessionIdKey = 'gamezilla_session_id';
