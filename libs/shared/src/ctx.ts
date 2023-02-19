import { UserId, Username } from './data';

export type Ctx = {
  now: number;
  profiles: {
    [userId: UserId]: {
      userId: UserId;
      username: Username;
      avatarUrl: string;
    };
  };
  currentUserId: UserId;
  theme: {
    primary: {
      light: string;
      dark: string;
    };
  };
};
