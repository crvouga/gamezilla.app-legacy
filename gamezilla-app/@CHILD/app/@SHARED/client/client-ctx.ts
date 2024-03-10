import { UserId, Username } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import * as Route from "./client-route"
import { Translator } from "gamezilla-app/@SHARED/l18n/generated"

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type AnonymousClientCtx = {
  t: Translator
  currentRoute: Route.AppRoute
  now: Posix
  currentUserId?: UserId | null
  profiles: { [userId: UserId]: Profile }
  documentVisibilityState: DocumentVisibilityState
}

export type ClientCtx = AnonymousClientCtx & {
  currentUserId: UserId
}
