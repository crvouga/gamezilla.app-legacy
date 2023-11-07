import { Profile, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Route } from "./client-route";

export type ClientEvt =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" }
  | { t: "server-connected" }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "route-changed"; route: Route }
  | { t: "document-visibility-changed"; state: DocumentVisibilityState };

export const gotProfiles = (
  profiles?: {
    [userId: UserId]: Profile;
  } | null
): ClientEvt => {
  return {
    t: "got-profiles",
    profiles: profiles ?? {},
  };
};
