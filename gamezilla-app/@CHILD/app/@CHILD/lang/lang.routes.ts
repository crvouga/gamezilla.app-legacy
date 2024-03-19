import { P1 } from "gamezilla-app/@SHARED/parsing"

export type Route = {
  n: "lang"
  t: "choose-lang"
}

export const toRoute = P1.union<Route>([
  (x) =>
    P1.obj(x) && P1.tag(x, "n", "lang") && P1.tag(x, "t", "choose-lang")
      ? x
      : null,
])
