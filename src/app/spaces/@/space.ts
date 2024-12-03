import { p } from '@/core/parser'
import { SpaceId, UserId } from 'app/@/data'

const parser = p.obj({
  visibility: p.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: p.dict(UserId, UserId)
})

export type Space = p.Infer<typeof parser>

const random = (): Space => {
  return {
    hostId: UserId.generate(),
    spaceId: SpaceId.generate(),
    users: {},
    visibility: 'public'
  }
}

export const Space = {
  ...parser,
  random
}
