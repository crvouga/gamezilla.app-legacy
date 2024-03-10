import { UserId, Username } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Posix } from "gamezilla-app/@SHARED/core"
import * as Route from "./client-route"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n/lang-code-iso-639-1"

type Profile = {
  userId: UserId
  username: Username
  avatarUrl: string
}

export type AnonymousClientCtx = {
  lang: LanguageCodeISO_639_1
  currentRoute: Route.AppRoute
  now: Posix
  currentUserId?: UserId | null
  profiles: { [userId: UserId]: Profile }
  documentVisibilityState: DocumentVisibilityState
}

export type ClientCtx = AnonymousClientCtx & {
  currentUserId: UserId
}
