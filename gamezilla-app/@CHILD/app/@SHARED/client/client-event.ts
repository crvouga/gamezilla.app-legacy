import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"

export type ClientEvent =
  | { t: "auth/authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "auth/unauthenticated" }
  | { t: "wire/server-connected" }
  | { t: "routing/route-changed"; route: Record<string, unknown> }
  | {
      t: "platform/document-visibility-changed"
      state: DocumentVisibilityState
    }
  | { t: "time/elapsed" }

export const routeChanged = (route: Record<string, unknown>): ClientEvent => {
  return { t: "routing/route-changed", route }
}

export const serverConnected = (): ClientEvent => {
  return { t: "wire/server-connected" }
}
