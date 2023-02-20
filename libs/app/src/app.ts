import { Auth } from '@gamezilla/auth';
import { ChatStore } from '@gamezilla/chat';
import { Option } from '@gamezilla/core';
import { Party } from '@gamezilla/party';
import { ProfileStore } from '@gamezilla/profile';
import * as GameRoom from '@gamezilla/room';
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
  party: Party.BackendModel;
  gameRoom: GameRoom.BackendModel;
  sessions: {
    [sessionId: SessionId]: Session;
  };
};

export type Session = {
  sessionId: SessionId;
  userId: Option<UserId>;
  clientId: Option<ClientId>;
};

export type FrontendModel = {
  alerts: Alerts.Model<FrontendMsg>;
  chatStore: ChatStore.Model;
  auth: Auth.Model;
  page: Page.Model;
  route: Route.Model;
  gameRoom: GameRoom.FrontendModel;
  party: Party.FrontendModel;
  wire: WireModel;
  profileStore: ProfileStore.Model;
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
  | ['room', GameRoom.ToBackend]
  | ['party', Party.ToBackend]
  | ['auth', Auth.ToBackend];

export type ToFrontend =
  | ['room', GameRoom.ToFrontend]
  | ['party', Party.ToFrontend];

export type FrontendMsg =
  | ['→', ToFrontend]
  | ['wire', WireModel['type']]
  | ['route', Route.Msg]
  | ['alerts', Alerts.Msg]
  | ['room', GameRoom.FrontendMsg]
  | ['chat-store', ChatStore.Msg]
  | ['auth', Auth.Msg]
  | ['page', Page.Msg]
  | ['party', Party.FrontendMsg]
  | ['profile-store', ProfileStore.Msg];

export type BackendMsg =
  | ['→', SessionId, ClientId, ToBackend]
  | ['client-connected', SessionId, ClientId]
  | ['client-disconnected', SessionId, ClientId]
  | ['room', GameRoom.BackendMsg]
  | ['party', Party.BackendMsg];

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
