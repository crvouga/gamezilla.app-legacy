import { UserId, Username } from "gamezilla/app/@SHARED/data";
import { Posix } from "gamezilla/@SHARED/core";
import * as Route from "./client-route";

type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};

export type AnonymousViewCtx = {
  push: (route: Route.Route) => void;
  back: () => void;
  now: Posix;
  documentVisibilityState: DocumentVisibilityState;
  profiles: { [userId: UserId]: Profile };
  sound: { muted: boolean };
  toggleSound: () => void;
};

export type ViewCtx = AnonymousViewCtx & {
  currentUserId: UserId;
};

export type ClientCtx = {
  now: Posix;
  profiles: { [userId: UserId]: Profile };
  currentUserId: UserId;
  documentVisibilityState: DocumentVisibilityState;
};

export type AnonymousClientCtx = {
  currentUserId?: UserId | null;
  now: Posix;
  profiles: { [userId: UserId]: Profile };
  documentVisibilityState: DocumentVisibilityState;
};
