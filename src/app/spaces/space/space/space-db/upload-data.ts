import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { ISpaceDb } from './interface'

export const UploadData = (_config: { spaceDb: ISpaceDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('space:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
