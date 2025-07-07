import { s } from '~/@/schema'
import { CrudTransaction } from '~/@/sync-engine/crud-transaction/crud-transaction'

export const ENDPOINT = '/sync/push'

export const RequestBody = s.obj({
  crudTransaction: CrudTransaction,
})
export type RequestBody = s.Infer<typeof RequestBody>
