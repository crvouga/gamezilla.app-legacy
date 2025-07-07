import { IDb } from '~/@/db/interface'
import { s } from '~/@/schema'
import { Todo } from '../todo'

const schema = IDb.schema({
  Entity: Todo.schema,
  Related: s.partialObj({}),
})

export type ITodoDb = IDb.Infer<typeof schema>

export const ITodoDb = {
  schema,
}
