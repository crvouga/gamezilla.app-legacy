import { s } from '~/@/schema'
import { CrudTransaction } from '~/@/upload-data/crud-transaction'

export const ENDPOINT = '/powersync/upload-data'

export const RequestBody = s.obj({
  crudTransaction: CrudTransaction,
})
export type RequestBody = s.Infer<typeof RequestBody>
