import { UserId, Username } from "src/shared/app";
import { Posix } from "src/core";
import * as Route from "./route";

type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
  themeMode?: string;
};

export type UnauthenticatedViewCtx = {
  onPush: (route: Route.Route) => void;
  onBack: () => void;
  now: Posix;
  profiles: { [userId: UserId]: Profile };
};

export type ViewCtx = UnauthenticatedViewCtx & {
  currentUserId: UserId;
};

export type ClientCtx = {
  now: Posix;
  profiles: { [userId: UserId]: Profile };
  currentUserId: UserId;
};
