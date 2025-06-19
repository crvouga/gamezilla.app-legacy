import { s } from '../../schema'
import { CrudTransactionEntryOp } from './crud-transaction-entry-op'

const schema = s.obj({
  op: CrudTransactionEntryOp,
  id: s.str(),
  collection: s.str(),
  newData: s.maybe(s.partialDict(s.str(), s.unknown)),
  prevData: s.maybe(s.partialDict(s.str(), s.unknown)),
})

export type CrudTransactionEntry = s.Infer<typeof schema>

export const CrudTransactionEntry = {
  ...schema,
}
