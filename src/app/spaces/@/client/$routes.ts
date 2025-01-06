import { p } from '~/@/parser'
import { Result } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'

export const Route = p.or(
  p.obj({
    n: p.l('spaces'),
    t: p.l('space-list'),
  }),
  p.obj({
    n: p.l('spaces'),
    t: p.l('space'),
    spaceId: p.custom(SpaceId.is, 'Invalid space id'),
  }),
)

export type Route = p.Infer<typeof Route>

export const toRoute = (route: unknown): Route | null => Result.unwrapOr(Route.parse(route), null)
