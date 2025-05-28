import { p } from '~/@/schema'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

const Screen = p.or(
  p.obj({
    n: p.l('profile'),
    t: p.l('profile'),
    userId: UserId,
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit'),
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit-avatar'),
  }),
  p.obj({
    n: p.l('profile'),
    t: p.l('profile-edit-username'),
  }),
)

export type Screen = p.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
