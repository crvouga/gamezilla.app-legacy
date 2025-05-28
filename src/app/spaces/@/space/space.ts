import { s } from '~/@/schema'
import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'

const parser = s.obj({
  visibility: s.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: s.dict(UserId, UserId),
})

export type Space = s.Infer<typeof parser>

const random = (): Space => {
  return {
    hostId: UserId.generate(),
    spaceId: SpaceId.generate(),
    users: {},
    visibility: 'public',
  }
}

export const Space = {
  ...parser,
  random,
}
