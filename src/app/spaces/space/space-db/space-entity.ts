import { s } from '~/@/schema'
import { UnixMs } from '~/@/time/unix-ms'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space'

// Entity schema for the space table
export const SpaceEntity = s.obj({
  id: SpaceId,
  createdAt: UnixMs,
  updatedAt: UnixMs,
  deletedAt: s.maybe(UnixMs),
  space: Space.schema,
})

export type SpaceEntity = s.Infer<typeof SpaceEntity>
