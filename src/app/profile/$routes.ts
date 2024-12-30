import { p } from '~/@/parser'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

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
