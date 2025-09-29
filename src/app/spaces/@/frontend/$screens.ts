import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'

export const Screen = s.or(
  s.obj({
    n: s.l('spaces'),
    t: s.l('spaces_list'),
  }),
  s.obj({
    n: s.l('spaces'),
    t: s.l('spaces_space'),
    spaceId: s.custom(SpaceId.is, 'Invalid space id'),
  }),
)

export type Screen = s.Infer<typeof Screen>

export const toScreen = (screen: unknown): Screen | null => Result.unwrapOr(Screen.parse(screen), null)
