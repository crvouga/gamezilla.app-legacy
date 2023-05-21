import { UserId, Username } from '@gamezilla/shared/app';
import { Posix } from '@gamezilla/shared/core';
import * as Route from './route';

type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
  themeMode?: string;
};

export type UnauthenticatedViewCtx = {
  $push: (route: Route.Route) => void;
  $back: () => void;
  now: Posix;
  profiles: { [userId: UserId]: Profile };
};

export type ViewCtx = UnauthenticatedViewCtx & {
  currentUserId: UserId;
};

export type Ctx = {
  now: Posix;
  profiles: { [userId: UserId]: Profile };
  currentUserId: UserId;
};

export type AppMsg =
  | { t: 'route-changed'; route: Route.Route }
  | { t: 'wire-connected' }
  | { t: 'user-logged-in'; currentUserId: UserId }
  | { t: 'toast-enqueued'; message: string };
