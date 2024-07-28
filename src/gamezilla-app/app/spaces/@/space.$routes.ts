import { SpaceId } from 'gamezilla-app/app/@/data'
import { Result } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'

export const Route = p.or(
  p.obj({
    n: p.l('spaces'),
    t: p.l('space-list')
  }),
  p.obj({
    n: p.l('spaces'),
    t: p.l('space'),
    spaceId: p.custom(SpaceId.is, 'Invalid space id')
  })
)

export type Route = p.Infer<typeof Route>

export const toRoute = (route: unknown): Route | null => Result.withDefault(Route.parse(route), null)
