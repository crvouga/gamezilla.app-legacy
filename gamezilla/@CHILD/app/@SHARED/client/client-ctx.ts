import { UserId, Username } from "gamezilla/@CHILD/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import * as Route from "./client-route";

type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};

export type AnonymousViewCtx = {
  push: (route: Route.AppRoute) => void;
  back: () => void;
  currentRoute: Route.AppRoute;
  now: Posix;
  documentVisibilityState: DocumentVisibilityState;
  profiles: { [userId: UserId]: Profile };
};

export type ViewCtx = AnonymousViewCtx & {
  currentUserId: UserId;
};

export type AnonymousClientCtx = {
  currentRoute: Route.AppRoute;
  now: Posix;
  currentUserId?: UserId | null;
  profiles: { [userId: UserId]: Profile };
  documentVisibilityState: DocumentVisibilityState;
};

export type ClientCtx = AnonymousClientCtx & {
  currentUserId: UserId;
};
