import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
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
    userId: s.partialObj({
      in: s.arr(UserId),
    }),
  }),
  limit: s.num(),
  offset: s.num(),
})

export type SpaceDbQuery = s.Infer<typeof schema>

const toKey = (input: SpaceDbQuery): string => deterministicJsonStringify(input)

export const SpaceDbQuery = {
  ...schema,
  toKey,
}
