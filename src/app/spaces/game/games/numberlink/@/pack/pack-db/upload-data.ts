import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IPackDb } from './interface'

export const UploadData = (_config: { numberlinkPackDb: IPackDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('pack:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
