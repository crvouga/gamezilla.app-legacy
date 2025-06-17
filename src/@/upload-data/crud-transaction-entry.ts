import { s } from '../schema'

const schema = s.obj({
  type: s.enumeration(['create', 'update', 'delete']),
  id: s.str(),
  table: s.str(),
  newData: s.dict(s.str(), s.unknown),
  prevData: s.dict(s.str(), s.unknown),
})

export type CrudTransactionEntry = s.Infer<typeof schema>

export const CrudTransactionEntry = {
  ...schema,
}
