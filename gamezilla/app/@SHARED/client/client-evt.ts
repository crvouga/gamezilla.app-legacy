import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { Route } from "./client-route";

export type ClientEvt =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" }
  | { t: "server-connected" }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "route-changed"; route: Route };
