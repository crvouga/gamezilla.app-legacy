import { Err, isErr, Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '.'
import { ISpaceDb } from './space-db/interface'

export const UploadDataSpace = (_config: { spaceDb: ISpaceDb }): IUploadData => {
  return {
    match: ({ entry }) => {
      return SpaceId.is(entry.id)
    },
    upload: async ({ entry }) => {
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
  }
}
