import { Auth } from '@gamezilla/auth';
import { ChatFrontend, ChatStore } from '@gamezilla/chat';
import { ProfileStore } from '@gamezilla/profile';
import * as Room from '@gamezilla/room';
import { Alerts, ClientId, Route, SessionId, UserId } from '@gamezilla/shared';
import * as Page from './app-page';

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
};

export type Session = {
  sessionId: SessionId;
  userId?: UserId;
  clientId?: ClientId;
};

export type FrontendModel = {
  alerts: Alerts.Model<FrontendMsg>;
  chatStore: ChatStore.Model;
  auth: Auth.Model;
  page: Page.Model;
  route: Route.Model;
  room: Room.FrontendModel;
  wire: WireModel;
  profileStore: ProfileStore.Model;
  chat: ChatFrontend.Model;
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
  | { t: 'auth'; c: Auth.ToBackend };

export type ToFrontend = { t: 'room'; c: Room.ToFrontend };

export type FrontendMsg =
  | { t: '→'; c: ToFrontend }
  | { t: 'wire'; c: WireModel['type'] }
  | { t: 'route'; c: Route.Msg }
  | { t: 'alerts'; c: Alerts.Msg }
  | { t: 'room'; c: Room.FrontendMsg }
  | { t: 'chat-store'; c: ChatStore.Msg }
  | { t: 'chat'; c: ChatFrontend.Msg }
  | { t: 'auth'; c: Auth.Msg }
  | { t: 'page'; c: Page.Msg }
  | { t: 'profile-store'; c: ProfileStore.Msg };

export type BackendMsg =
  | { t: '→'; sessionId: SessionId; clientId: ClientId; c: ToBackend }
  | { t: 'client-connected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'client-disconnected'; sessionId: SessionId; clientId: ClientId }
  | { t: 'room'; c: Room.BackendMsg };

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
