import { UserId, Username } from "gamezilla/app/@";
import { Route } from "./client-route";

export type ClientAppMsg =
  | { t: "route-changed"; route: Route }
  | { t: "push-route"; route: Route }
  | { t: "route-back" }
  | { t: "server-connected" }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" };

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};
