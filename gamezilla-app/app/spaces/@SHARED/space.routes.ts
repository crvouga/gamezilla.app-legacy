import { SpaceId } from "gamezilla-app/app/@SHARED/data"
import { Result } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"

export const Route = p.or(
  p.obj({
    n: p.l("spaces"),
    t: p.l("space-list"),
  }),
  p.obj({
    n: p.l("spaces"),
    t: p.l("space"),
    spaceId: p.custom(SpaceId.is, "Invalid space id"),
  }),
)

export type Route = p.Infer<typeof Route>

export const toRoute = (route: unknown): Route | null =>
  Result.withDefault(Route.parse(route), null)
