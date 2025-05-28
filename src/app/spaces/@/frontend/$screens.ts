import { p } from '~/@/schema'
import { Result } from '~/@/result'
import { SpaceId } from '~/app/@/data/space-id'

export const Screen = p.or(
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

export type Screen = p.Infer<typeof Screen>

export const toScreen = (screen: unknown): Screen | null => Result.unwrapOr(Screen.parse(screen), null)
