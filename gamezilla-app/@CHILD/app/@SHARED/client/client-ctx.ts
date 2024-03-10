import { UserId, Username } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import * as Route from "./client-route"

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type AnonymousClientCtx = {
  lang: "en" | "es"
  currentRoute: Route.AppRoute
  now: Posix
  currentUserId?: UserId | null
  profiles: { [userId: UserId]: Profile }
  documentVisibilityState: DocumentVisibilityState
}

export type ClientCtx = AnonymousClientCtx & {
  currentUserId: UserId
}
