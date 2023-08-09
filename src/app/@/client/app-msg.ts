import { UserId, Username } from "src/app/@/app";
import { Route } from "./route";

export type ClientAppMsg =
  | { t: "route-changed"; route: Route }
  | { t: "push-route"; route: Route }
  | { t: "route-back" }
  | { t: "wire-connected" }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: string]: Profile } }
  | { t: "current-user-authenticated"; userId: UserId }
  | { t: "current-user-unauthenticated" };

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};
