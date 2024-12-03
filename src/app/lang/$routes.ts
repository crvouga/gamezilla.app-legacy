import { Result } from '~/@/core'
import { p } from '~/@/core/parser'

const Route = p.obj({
  n: p.l('lang'),
  t: p.l('choose-lang')
})

export type Route = p.Infer<typeof Route>

export const toRoute = (x: unknown): Route | null => Result.unwrapOr(Route.parse(x), null)
