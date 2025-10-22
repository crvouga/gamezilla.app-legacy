import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

// Entity schema for the space_projection_user table
export const SpaceProjectionUserEntity = s.obj({
  id: s.str(), // Composite key: spaceId-userId
  spaceId: SpaceId,
  userId: UserId,
})

export type SpaceProjectionUserEntity = s.Infer<typeof SpaceProjectionUserEntity>
