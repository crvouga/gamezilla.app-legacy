import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppRoute } from "./client-route";

export type ClientEvt =
  | { t: "auth/client-authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "auth/client-unauthenticated" }
  | { t: "wire/server-connected" }
  | { t: "routing/route-changed"; route: AppRoute }
  | {
      t: "platform/document-visibility-changed";
      state: DocumentVisibilityState;
    };
