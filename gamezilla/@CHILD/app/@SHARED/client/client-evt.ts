import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { AppRoute } from "./client-route";

export type ClientEvt =
  | { t: "is-logged-in"; userId: UserId; loggedIn: boolean }
  | { t: "is-logged-out" }
  | { t: "wire/server-connected" }
  | { t: "routing/route-changed"; route: AppRoute }
  | {
      t: "platform/document-visibility-changed";
      state: DocumentVisibilityState;
    };
