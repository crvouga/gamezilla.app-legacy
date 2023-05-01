import * as Auth from '@gamezilla/auth';
import * as Chat from '@gamezilla/chat';
import * as Profile from '@gamezilla/profile';
import * as Room from '@gamezilla/room';
import { Alerts, ClientId, Route, SessionId, UserId } from '@gamezilla/shared';

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
  profile: Profile.BackendModel;
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
  profile: Profile.FrontendModel;
  chat: Chat.FrontendModel;
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
  | { t: 'profile'; c: Profile.ToBackend };

export type ToFrontend =
  | { t: 'room'; c: Room.ToFrontend }
  | { t: 'profile'; c: Profile.ToFrontend };

export type FrontendMsg =
  | { t: '→'; c: ToFrontend }
  | { t: 'wire'; wire: WireModel['type'] }
  | { t: 'route'; c: Route.Msg }
  | { t: 'alerts'; c: Alerts.Msg }
  | { t: 'room'; c: Room.FrontendMsg }
  | { t: 'chat'; c: Chat.FrontendMsg }
  | { t: 'auth'; c: Auth.FrontendMsg }
  | { t: 'profile'; c: Profile.FrontendMsg };

export type BackendMsg =
  | { t: '→'; sessionId: SessionId; clientId: ClientId; c: ToBackend }
  | { t: 'client-connected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'client-disconnected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'room'; c: Room.BackendMsg }
  | { t: 'profile'; c: Profile.BackendMsg };

//
//
//
// Transport
//
//
//

export type ServerToClientEvents = {
  ['to-frontend']: (msg: ToFrontend) => void;
  ['session-id']: (sessionId: SessionId) => void;
};

export type ClientToServerEvents = {
  ['to-backend']: (msg: ToBackend) => void;
};

export const backendServerPort = 5000;

export const sessionIdKey = 'gamezilla_session_id';
