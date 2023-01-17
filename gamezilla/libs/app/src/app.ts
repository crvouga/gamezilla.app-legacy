import { Alerts } from '@gamezilla/alerts';
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
  | 'Connected';

//
//
//
// Msg
//
//
//

export type ToBackend =
  | ['Room', GameRoom.ToBackend]
  | ['Party', Party.ToBackend]
  | ['Auth', Auth.ToBackend];

export type ToFrontend =
  | ['Room', GameRoom.ToFrontend]
  | ['Party', Party.ToFrontend]
  | ['Session', SessionId];

export type FrontendMsg =
  | ['▶', ToFrontend]
  | ['Wire', WireStatus]
  | ['Route', Route.Msg]
  | ['Alerts', Alerts.Msg]
  | ['Room', GameRoom.FrontendMsg]
  | ['Store', ChatStore.Msg]
  | ['Auth', Auth.Msg]
  | ['Page', Page.Msg]
  | ['LocalStoragePut_Done', LocalStorage.PutResult]
  | ['Party', Party.FrontendMsg]
  | ['ProfileStore', ProfileStore.Msg];

export type BackendMsg =
  | ['▶', SessionId, ClientId, ToBackend]
  | ['ClientConnected', SessionId, ClientId]
  | ['ClientDisconnected', SessionId, ClientId]
  | ['Room', GameRoom.BackendMsg]
  | ['Party', Party.BackendMsg];

//
//
//
// Transport
//
//
//

export type ServerToClientEvents = {
  ToFrontend: (msg: ToFrontend) => void;
};

export type ClientToServerEvents = {
  ToBackend: (msg: ToBackend) => void;
};

export const backendServerPort = 5000;

export const sessionIdKey = 'gamezilla_session_id';
