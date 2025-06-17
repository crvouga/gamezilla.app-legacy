import { Err, isErr, Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { ISpaceDb } from './space-db/interface'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '.'

export const UploadDataSpace = (_config: { spaceDb: ISpaceDb }): IUploadData => {
  return {
    match: (entry) => {
      return SpaceId.is(entry.id)
    },
    upload: async (entry) => {
      const space = Space.fromUnknown(entry.newData)

      if (isErr(space)) {
        return Err(space.error)
      }

      return Ok(null)
    },
  }
}
