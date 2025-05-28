import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

const Screen = s.or(
  s.obj({
    n: s.l('profile'),
    t: s.l('profile'),
    userId: UserId,
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile-edit'),
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile-edit-avatar'),
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile-edit-username'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
