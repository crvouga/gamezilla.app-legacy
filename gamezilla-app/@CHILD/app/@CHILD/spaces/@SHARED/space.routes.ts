import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { P1 } from "gamezilla-app/@SHARED/parsing"

export type Route =
  | {
      n: "spaces"
      t: "space-list"
    }
  | {
      n: "spaces"
      t: "space"
      spaceId: SpaceId
    }

export const toRoute = P1.union<Route>([
  (x) =>
    P1.obj(x) && P1.tag(x, "n", "spaces") && P1.tag(x, "t", "space-list")
      ? x
      : null,
  (x) =>
    P1.obj(x) &&
    P1.tag(x, "n", "spaces") &&
    P1.tag(x, "t", "space") &&
    P1.has(x, "spaceId", SpaceId.is)
      ? x
      : null,
])
