import { Profile, UserId } from "gamezilla/app/@SHARED/data";
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

export type ToChild =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" };

export type ToParent<ToServer = unknown> =
  | { t: "send-to-server"; msg: ToServer }
  | { t: "enqueue-toast"; text: string; duration?: number };
