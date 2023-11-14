import { Profile, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppRoute } from "./client-route";

export type ClientEvt =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" }
  | { t: "server-connected" }
  | { t: "got-profiles"; profiles: { [userId: UserId]: Profile } }
  | { t: "route-changed"; route: AppRoute }
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
