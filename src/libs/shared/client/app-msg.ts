import { UserId, Username } from "@gamezilla/shared/app";
import { Route } from "./route";

export type ClientAppMsg =
  | { t: "route-changed"; route: Route }
  | { t: "push-route"; route: Route }
  | { t: "route-back" }
  | { t: "wire-connected" }
  | { t: "got-current-user"; userId: UserId | null }
  | { t: "toast-enqueued"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: string]: Profile } };

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};
