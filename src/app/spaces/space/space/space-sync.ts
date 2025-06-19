import { Err, isErr, Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '.'
import { ISpaceDb } from './space-db/interface'

export const SpaceSync = (_config: { spaceDb: ISpaceDb }): ISync => {
  return {
    match({ entry }) {
      return SpaceId.is(entry.id)
    },
    async push({ entry }) {
      const space = Space.fromUnknown(entry.newData)

      if (isErr(space)) {
        return Err(space.error)
      }

      // const spaceProjection = Space.toSpaceProjection(space.value)

      // if (spaceProjection.type === 'started' && spaceProjection.hostId !== ctx.sessionId) {
      //   return Err('not-allowed')
      // }

      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
