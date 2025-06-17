import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IPackDb } from './pack-db/interface'
import { PackId } from './pack-id'

export const UploadDataPack = (_config: { numberlinkPackDb: IPackDb }): IUploadData => {
  return {
    match: (entry) => {
      return PackId.is(entry.id)
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}

export const UploadDataPackItem = (_config: { numberlinkPackDb: IPackDb }): IUploadData => {
  return {
    match: (entry) => {
      return PackId.is(entry.id)
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
