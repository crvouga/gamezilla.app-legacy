import { s } from '../../schema'
import { CrudTransactionEntry } from './crud-transaction-entry'

const schema = s.obj({
  entries: s.arr(CrudTransactionEntry),
})

export type CrudTransaction = s.Infer<typeof schema>

export const CrudTransaction = {
  ...schema,
}
