import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'

const Screen = s.or(
  s.obj({
    n: s.l('profile'),
    t: s.l('profile_profile'),
    userId: UserId,
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile_profileEdit'),
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile_profileEditAvatar'),
  }),
  s.obj({
    n: s.l('profile'),
    t: s.l('profile_profileEditUsername'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (x: unknown): Screen | null => Result.unwrapOr(Screen.parse(x), null)
