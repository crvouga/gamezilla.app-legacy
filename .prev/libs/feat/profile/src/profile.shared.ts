import { RemoteResult, Result } from '@gamezilla/shared/core';
import { ProfileAvatar, UserId, Username } from '@gamezilla/shared/app';

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

export type ClientModel = {
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

export type ServerModel = null;

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | Req
  | { t: 'inputted-username'; username: string }
  | { t: 'clicked-menu-button' }
  | { t: 'closed-menu' };

export type ServerMsg = { t: 'none' };

export type ToClient =
  | { t: 'current-user-profile'; result: Result<string, Profile[]> }
  | Res;

export type ToServer = Req;

export type Req =
  | { t: 'find-many'; userIds: UserId[] }
  | { t: 'change-username'; username: string }
  | { t: 'search'; query: string }
  | { t: 'delete-forever'; query: string };

export type Res = Req & { result: Result<string, Profile[]> };
