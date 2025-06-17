import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IGuestSessionMappingDb } from './interface'

export const UploadData = (_config: { guestSessionMappingDb: IGuestSessionMappingDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('guest-session-mapping:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
