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

export type ToBackend = ['room', Room.ToBackend] | ['auth', Auth.ToBackend];

export type ToFrontend = ['room', Room.ToFrontend];

export type FrontendMsg =
  | ['→', ToFrontend]
  | ['wire', WireModel['type']]
  | ['route', Route.Msg]
  | ['alerts', Alerts.Msg]
  | ['room', Room.FrontendMsg]
  | ['chat-store', ChatStore.Msg]
  | ['chat', ChatFrontend.Msg]
  | ['auth', Auth.Msg]
  | ['page', Page.Msg]
  | ['profile-store', ProfileStore.Msg];

export type BackendMsg =
  | ['→', SessionId, ClientId, ToBackend]
  | ['client-connected', SessionId, ClientId]
  | ['client-disconnected', SessionId, ClientId]
  | ['room', Room.BackendMsg];

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
