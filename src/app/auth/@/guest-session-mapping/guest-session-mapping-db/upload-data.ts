import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IGuestSessionMappingDb } from './interface'
import { GuestSessionMappingId } from '../guest-session-mapping-id'

export const UploadData = (_config: { guestSessionMappingDb: IGuestSessionMappingDb }): IUploadData => {
  return {
    match: (entry) => {
      return GuestSessionMappingId.is(entry.id)
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
