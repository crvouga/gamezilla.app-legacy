import { s } from '~/@/schema'

const schema = s.obj({
  id: s.str(),
  title: s.str(),
  completed: s.bool,
})

export type ITodo = s.Infer<typeof schema>

export const Todo = {
  schema,
}
