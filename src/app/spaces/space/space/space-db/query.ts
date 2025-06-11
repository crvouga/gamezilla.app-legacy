import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

const schema = s.partialObj({
  where: s.partialObj({
    spaceId: s.partialObj({
      '=': SpaceId,
    }),
    hostId: s.partialObj({
      '=': UserId,
    }),
  }),
  limit: s.num(),
  offset: s.num(),
})

export type SpaceQuery = s.Infer<typeof schema>

const toKey = (input: SpaceQuery): string => {
  return [
    input.where?.spaceId ? `spaceId=${input.where.spaceId['=']}` : '',
    input.where?.hostId ? `hostId=${input.where.hostId['=']}` : '',
    input.limit ? `limit=${input.limit}` : '',
    input.offset ? `offset=${input.offset}` : '',
  ]
    .filter(Boolean)
    .join('&')
}

export const SpaceQuery = {
  ...schema,
  toKey,
}
