import { RemoteResult, Result } from '@gamezilla/core';
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
    [key in Req['t']]?: RemoteResult<string, null>;
  };
  draft?: {
    username?: string;
    avatarSeed?: ProfileAvatar.Seed;
    avatarStyle?: ProfileAvatar.Style;
    themeMode?: 'Light' | 'Dark' | 'System';
  };
  opened?: 'menu' | null;
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

export type FrontendMsg =
  | Req
  | { t: 'inputted-username'; username: string }
  | { t: 'clicked-menu-button' }
  | { t: 'closed-menu' };

export type BackendMsg = { t: 'none' };

export type ToFrontend = Res;

export type ToBackend = Req;

export type Req =
  | { t: 'find-else-create'; userId: UserId }
  | { t: 'find-many'; userIds: UserId[] }
  | { t: 'change-username'; username: string }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string };

export type Res = Req & { result: Result<string, Profile[]> };
