import { Ok } from '~/@/result'
import { ITodo } from '../todo'
import { ITodoDb } from './interface'

export type Config = {
  t: 'hash-map'
}

export const TodoDb = (_config: Config): ITodoDb => {
  const todos = new Map<string, ITodo>()

  return {
    async create(todo: ITodo) {
      todos.set(todo.id, todo)
      return Ok(null)
    },

    async read() {
      return Ok(Array.from(todos.values()))
    },

    async update(todo: Partial<ITodo>) {
      if (!todo.id || !todos.has(todo.id)) {
        return Ok(null)
      }
      const existing = todos.get(todo.id)!
      todos.set(todo.id, { ...existing, ...todo })
      return Ok(null)
    },

    async delete(id: string) {
      todos.delete(id)
      return Ok(null)
    },
  }
}
