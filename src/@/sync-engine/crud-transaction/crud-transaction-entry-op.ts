import { s } from '../../schema'

const schema = s.enumeration(['create', 'update', 'delete', 'upsert'] as const)

export type CrudTransactionEntryOp = s.Infer<typeof schema>

export const CrudTransactionEntryOp = {
  ...schema,
}
