import { s } from '../../schema'
import { CrudTransactionEntry } from './crud-transaction-entry'

const schema = s.obj({
  entries: s.arr(CrudTransactionEntry),
  id: s.str(),
  sessionId: s.str(),
  clientSessionId: s.str(),
  committed: s.bool,
  committedAtUnixMs: s.num(),
})

export type CrudTransaction = s.Infer<typeof schema>

export const CrudTransaction = {
  ...schema,
}
