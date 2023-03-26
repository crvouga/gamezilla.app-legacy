import { RemoteData, Result } from '@gamezilla/core';
import { ProfileAvatar, UserId, Username } from '@gamezilla/temp-shared';

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

export type FrontendModel_ = {
  profiles: {
    [userId: UserId]: Profile;
  };
  requests: {
    [key in Req[0]]?: RemoteData<Problem, null>;
  };
  draft?: {
    username: string;
    avatarSeed: ProfileAvatar.Seed;
    avatarStyle: ProfileAvatar.Style;
    themeMode: 'Light' | 'Dark' | 'System';
  };
};

export type FrontendModel = FrontendModel_;

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

type Problem = ['database-error', string] | ['unknown-shape'];

export type Req =
  | ['find-many', { userId: UserId[] }]
  | ['search', { query: string }];

export type Res =
  | ['find-many', { userId: UserId[] }, Result<Problem, Profile[]>]
  | ['search', { userId: UserId[] }, Result<Problem, Profile[]>]
  | ['create', { userId: UserId }, Result<Problem, null>]
  | ['destroy-forever', { userId: UserId }, Result<Problem, null>];
