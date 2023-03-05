import { Result } from '@gamezilla/core';
import { UserId, Username } from '@gamezilla/shared';

//
//
//
// Model
//
//
//

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
  themeMode: 'Light' | 'Dark' | 'System';
};

export type FrontendModel = null;

export type BackendModel = null;

//
//
//
// Msg
//
//
//

export type FrontendMsg = Req;

export type BackendMsg = ['none'];

export type ToFrontend = Res;

export type ToBackend = Req;

//
//
// Req/Res
//
//

type Problem = ['database_error', string];

export type Req =
  | ['find_many', { userId: UserId[] }]
  | ['search', { query: string }];

export type Res =
  | ['find_many', { userId: UserId[] }, Result<Problem, Profile[]>]
  | ['search', { userId: UserId[] }, Result<Problem, Profile[]>];
