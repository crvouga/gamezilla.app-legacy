import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { AppRoute } from "./client-route"

export type ClientEvent =
  | { t: "is-logged-in"; userId: UserId; loggedIn: boolean }
  | { t: "is-logged-out" }
  | { t: "wire/server-connected" }
  | { t: "routing/route-changed"; route: AppRoute }
  | {
      t: "platform/document-visibility-changed"
      state: DocumentVisibilityState
    }

export const routeChanged = (route: AppRoute): ClientEvent => {
  return { t: "routing/route-changed", route }
}

export const serverConnected = (): ClientEvent => {
  return { t: "wire/server-connected" }
}
