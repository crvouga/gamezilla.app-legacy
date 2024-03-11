import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Route } from "gamezilla-app/@SHARED/routing/generated/routes"

export type ClientEvent =
  | { t: "auth/authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "auth/unauthenticated" }
  | { t: "wire/server-connected" }
  | { t: "routing/route-changed"; route: Route }
  | {
      t: "platform/document-visibility-changed"
      state: DocumentVisibilityState
    }
  | { t: "time/elapsed" }

export const routeChanged = (route: Route): ClientEvent => {
  return { t: "routing/route-changed", route }
}

export const serverConnected = (): ClientEvent => {
  return { t: "wire/server-connected" }
}
