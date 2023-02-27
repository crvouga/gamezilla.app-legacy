import { UserId } from '@gamezilla/shared';

//
//
// Model
//
//

export type FrontendModel = SharedModel;

export type BackendModel = SharedModel;

export type SharedModel = {
  playerId: UserId;
};

//
//
// Msg
//
//

export type FrontendMsg = ['none'];

export type BackendMsg = ['none'];

export type ToBackend = ['none'];

export type ToFrontend = ['none'];
