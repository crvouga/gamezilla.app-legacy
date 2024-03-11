import { Namespace } from "gamezilla-app/@SHARED/msg"
import { P } from "gamezilla-app/@SHARED/parsing"

export const Msg = Namespace("lang")

export type Route = {
  n: "lang"
  t: "choose-lang"
}

export const toRoute = P.union<Route>([
  (x) =>
    P.obj(x) && P.tag(x, "n", "lang") && P.tag(x, "t", "choose-lang")
      ? x
      : null,
])

export const LangRoutes = {
  ChooseLang: Msg("choose-lang"),
}
