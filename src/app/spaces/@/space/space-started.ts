import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

const schema = s.obj({
  type: s.l('started'),
  visibility: s.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: s.dict(UserId, UserId),
})

export type SpaceStarted = s.Infer<typeof schema>

export const SpaceStarted = {
  schema,
}
