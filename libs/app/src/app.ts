import { Alerts } from '@gamezilla/shared';
import { Auth } from '@gamezilla/auth';
import { ChatStore } from '@gamezilla/chat';
import { LocalStorage, Option } from '@gamezilla/core';
import { ClientId, SessionId, UserId } from '@gamezilla/shared';
import { Party } from '@gamezilla/party';
import { ProfileStore } from '@gamezilla/profile';
import * as GameRoom from '@gamezilla/room';
import { Route } from '@gamezilla/shared';
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
  wire: WireStatus;
  profileStore: ProfileStore.Model;
};

export type WireStatus =
  | 'Connecting'
  | 'ConnectError'
  | 'Disconnected'
  | 'connected';

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
  | ['party', Party.ToFrontend]
  | ['session', SessionId];

export type FrontendMsg =
  | ['→', ToFrontend]
  | ['wire', WireStatus]
  | ['route', Route.Msg]
  | ['alerts', Alerts.Msg]
  | ['room', GameRoom.FrontendMsg]
  | ['chat-store', ChatStore.Msg]
  | ['auth', Auth.Msg]
  | ['page', Page.Msg]
  | ['local-storage-put-done', LocalStorage.PutResult]
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
};

export type ClientToServerEvents = {
  ['to-backend']: (msg: ToBackend) => void;
};

export const backendServerPort = 5000;

export const sessionIdKey = 'gamezilla_session_id';
