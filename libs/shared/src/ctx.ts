import { Posix } from '@gamezilla/core';
import { UserId, Username } from './data';
import * as Route from './route';

export type Ctx = {
  now: Posix;
  profiles: {
    [userId: UserId]: {
      userId: UserId;
      username: Username;
      avatarUrl: string;
      themeMode?: string;
    };
  };
  currentUserId: UserId;
  $push: (route: Route.Model) => void;
};

export type AppMsg =
  | { t: 'route-changed'; route: Route.Model }
  | { t: 'wire-connected' };
