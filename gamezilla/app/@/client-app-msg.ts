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

export type FromParent =
  | { t: "route-changed"; route: Route }
  | { t: "server-connected" }
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" };

export type ToParent<ToServer> =
  | { t: "send-to-server"; msg: ToServer }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "push-route"; route: Route }
  | { t: "route-back" }
  | { t: "server-connected" }
  | { t: "enqueue-toast"; text: string; duration?: number }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } };

export type Profile = {
  userId: UserId;
  username: Username;
  avatarUrl: string;
};
