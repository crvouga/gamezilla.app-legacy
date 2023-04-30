import { RemoteData, Result } from '@gamezilla/core';
import { ProfileAvatar, UserId, Username } from '@gamezilla/shared';

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
    [key in Req['t']]?: RemoteData<Problem, null>;
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

export type BackendMsg = { t: 'none' };

export type ToFrontend = Res;

export type ToBackend = Req;

export type Req =
  | { t: 'find-many'; userId: UserId[] }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string };

export type Res = Req & { result: Result<Problem, Profile[]> };

type Problem =
  | { t: 'database-error'; message: string }
  | { t: 'unknown-shape' };
