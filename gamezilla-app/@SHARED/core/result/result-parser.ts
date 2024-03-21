import { p } from "gamezilla-app/@SHARED/core/parser"
import { ResultPrivate } from "./result"

export const parser = <TError, TValue>(
  errParser: p.Parser<TError>,
  okParser: p.Parser<TValue>,
): p.Parser<ResultPrivate<TError, TValue>> => {
  return p.or(
    p.obj({
      t: p.l("err"),
      error: errParser,
    }),
    p.obj({
      t: p.l("ok"),
      value: okParser,
    }),
  )
}
