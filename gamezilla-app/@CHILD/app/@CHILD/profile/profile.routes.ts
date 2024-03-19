import { P1 } from "gamezilla-app/@SHARED/parsing"
import { UserId } from "../../@SHARED/data"

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

export const toRoute = P1.union<Route>([
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "profile") &&
    P1.tag(x, "t", "profile") &&
    P1.has(x, "userId", UserId.is)
      ? x
      : null,
  (x) =>
    P1.obj(x) && P1.tag(x, "n", "profile") && P1.tag(x, "t", "profile-edit")
      ? x
      : null,
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "profile") &&
    P1.tag(x, "t", "profile-edit-avatar")
      ? x
      : null,
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "profile") &&
    P1.tag(x, "t", "profile-edit-username")
      ? x
      : null,
])
