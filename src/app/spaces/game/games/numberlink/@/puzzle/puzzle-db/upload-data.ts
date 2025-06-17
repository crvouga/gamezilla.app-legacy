import { Ok } from '~/@/result'
import { IUploadData } from '~/@/upload-data/upload-data'
import { IPuzzleDb } from './interface'

export const UploadData = (_config: { numberlinkPuzzleDb: IPuzzleDb }): IUploadData => {
  return {
    match: (entry) => {
      return entry.id.startsWith('puzzle:')
    },
    upload: async (_entry) => {
      return Ok(null)
    },
  }
}
