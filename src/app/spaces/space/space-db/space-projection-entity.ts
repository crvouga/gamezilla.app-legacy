import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

// Entity schema for the space_projection table
export const SpaceProjectionEntity = s.obj({
  id: SpaceId,
  hostId: s.maybe(UserId),
  gameId: s.maybe(s.str()),
  type: s.enumeration(['initial', 'started', 'ended'] as const),
})

export type SpaceProjectionEntity = s.Infer<typeof SpaceProjectionEntity>
