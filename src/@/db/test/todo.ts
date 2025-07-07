import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.obj({
  id: s.str(),
  title: s.str(),
  completed: s.bool,
  createdAt: s.num(),
  updatedAt: s.num(),
})

export type Todo = s.Infer<typeof schema>

const random = async (override?: Partial<Todo>): Promise<Todo> => {
  const now = Date.now()

  return {
    id: Uuid.generate(),
    title: 'title',
    completed: false,
    createdAt: now,
    updatedAt: now,
    ...override,
  }
}

export const Todo = {
  schema,
  random,
}
