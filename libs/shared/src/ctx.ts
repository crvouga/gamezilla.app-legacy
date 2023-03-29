import * as Route from './route';
import { UserId, Username } from './data';

export type Ctx = {
  now: number;
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
