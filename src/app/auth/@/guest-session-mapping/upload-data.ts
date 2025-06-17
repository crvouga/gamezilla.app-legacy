import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IGuestSessionMappingDb } from './guest-session-mapping-db/interface'
import { GuestSessionMappingId } from './guest-session-mapping-id'

export const UploadDataGuestSessionMapping = (_config: {
  guestSessionMappingDb: IGuestSessionMappingDb
}): IUploadData => {
  return {
    match: (entry) => {
      return GuestSessionMappingId.is(entry.id)
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
