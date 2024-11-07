import { Result } from '@/core'
import { p } from '@/core/parser'
import { UserId } from '../@/data'

const Route = p.or(
  p.obj({
    n: p.l('profile'),
    t: p.l('profile'),
    userId: UserId
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit')
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit-avatar')
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit-username')
  })
)

export type Route = p.Infer<typeof Route>

export const toRoute = (x: unknown): Route | null => Result.unwrapOr(Route.parse(x), null)
