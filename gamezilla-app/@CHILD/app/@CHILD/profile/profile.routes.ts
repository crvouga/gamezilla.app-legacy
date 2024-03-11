import { Namespace } from "gamezilla-app/@SHARED/msg"
import { P } from "gamezilla-app/@SHARED/parsing"
import { UserId } from "../../@SHARED/data"

const Msg = Namespace("profile")

export const ProfileRoutes = {
  Profile: Msg<{ userId: UserId }>("profile"),
  ProfileEdit: Msg("profile-edit"),
  ProfileEditAvatar: Msg("profile-edit-avatar"),
  ProfileEditUsername: Msg("profile-edit-username"),
}

export type Route =
  | {
      n: "profile"
      t: "profile"
      userId: UserId
    }
  | {
      n: "profile"
      t: "profile-edit"
    }
  | {
      n: "profile"
      t: "profile-edit-avatar"
    }
  | {
      n: "profile"
      t: "profile-edit-username"
    }

export const toRoute = P.union<Route>([
  (x) =>
    P.obj(x) &&
    P.tag(x, "n", "profile") &&
    P.tag(x, "t", "profile") &&
    P.has(x, "userId", UserId.is)
      ? x
      : null,
  (x) =>
    P.obj(x) && P.tag(x, "n", "profile") && P.tag(x, "t", "profile-edit")
      ? x
      : null,
  (x) =>
    P.obj(x) && P.tag(x, "n", "profile") && P.tag(x, "t", "profile-edit-avatar")
      ? x
      : null,
  (x) =>
    P.obj(x) &&
    P.tag(x, "n", "profile") &&
    P.tag(x, "t", "profile-edit-username")
      ? x
      : null,
])
