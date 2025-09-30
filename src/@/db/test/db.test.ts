import { ascend } from '~/@/array/sorting'
import { FileSystem } from '~/@/file-system'
import { KeyValueDb } from '~/@/key-value-db'
import { Logger } from '~/@/logger'
import { Pglite } from '~/@/pglite/impl'
import { unwrap } from '~/@/result'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import { describe, expect, test } from '~/@/test-runner'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { InferQueryInput } from '../interface/db'
import { Todo } from './todo'
import { TodoDb } from './todo-db/impl'
import { ITodoDb } from './todo-db/interface'

const Fixture = async (config: TodoDb) => {
  const todoDb = TodoDb.init(config)
  return {
    todoDb,
  }
}

const Fixtures = async () => {
  const configs: TodoDb[] = []
  const pglite = Pglite.init({ t: 'main-thread', config: { t: 'in-memory' } })
  const sqlDbPglite = BackendSqlDb.init({ t: 'pglite', pglite, logger: Logger.init({ t: 'noop' }) })
  const sqlDbSqlite = BackendSqlDb.init({
    t: 'better-sqlite3',
    databasePath: ':memory:',
    logger: Logger.init({ t: 'noop' }),
    fs: FileSystem.init({ t: 'node' }),
  })
  const kvDb = KeyValueDb.init({ t: 'in-memory' })
  const logger = Logger.init({ t: 'noop' })
  configs.push({ t: 'sql-db', sqlDb: sqlDbSqlite, logger, kvDb })
  configs.push({ t: 'sql-db', sqlDb: sqlDbPglite, logger, kvDb })
  configs.push({ t: 'hash-map', logger })
  return Promise.all(configs.map(Fixture))
}

describe('Db', () => {
  test('should work', async () => {
    for (const f of await Fixtures()) {
      const todo = await Todo.random()
      const before = await f.todoDb.query({
        where: { op: '=', column: 'id', value: todo.id },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      const upserted = await f.todoDb.upsert({
        entities: [todo],
      })
      const after = await f.todoDb.query({
        where: { op: '=', column: 'id', value: todo.id },
        orderBy: [],
        limit: 1,
        offset: 0,
      })
      expect(unwrap(before).entities.items).toEqual([])
      expect(unwrap(upserted).entities).toEqual([todo])
      expect(unwrap(after).entities.items).toEqual([todo])
    }
  })

  test('should paginate', async () => {
    for (const f of await Fixtures()) {
      const todos: Todo[] = []
      for (let i = 0; i < 10; i++) {
        const todo = await Todo.random()
        todos.push(todo)
      }
      todos.sort(ascend((t) => t.id))
      unwrap(await f.todoDb.upsert({ entities: todos }))
      const ids = todos.map((t) => t.id)
      const q: InferQueryInput<typeof ITodoDb.schema> = {
        where: { op: 'in', column: 'id', value: ids },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 3,
        offset: 0,
      }
      const page1 = await f.todoDb.query({ ...q, offset: 0 })
      const page2 = await f.todoDb.query({ ...q, offset: 3 })
      const page3 = await f.todoDb.query({ ...q, offset: 6 })
      const page4 = await f.todoDb.query({ ...q, offset: 9 })
      expect(unwrap(page1).entities.items).toEqual(todos.slice(0, 3))
      expect(unwrap(page2).entities.items).toEqual(todos.slice(3, 6))
      expect(unwrap(page3).entities.items).toEqual(todos.slice(6, 9))
      expect(unwrap(page4).entities.items).toEqual(todos.slice(9, 10))
    }
  })

  test('filter where value is null', async () => {
    for (const f of await Fixtures()) {
      const expected: Todo[] = []
      const unexpected: Todo[] = []
      for (let i = 0; i < 10; i++) {
        expected.push(await Todo.random({ deletedAt: null }))
        unexpected.push(await Todo.random({ deletedAt: UnixMs.now() }))
      }
      unwrap(await f.todoDb.upsert({ entities: [...unexpected, ...expected] }))
      expected.sort(ascend((t) => t.id))
      const before = await f.todoDb.query({
        where: { op: '=', column: 'deletedAt', value: null },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 100,
        offset: 0,
      })
      expect(unwrap(before).entities.items).toEqual(expected)
    }
  })

  test('filter when value is a number', async () => {
    for (const f of await Fixtures()) {
      const expected: Todo[] = []
      const unexpected: Todo[] = []
      const now = UnixMs.now()
      for (let i = 0; i < 10; i++) {
        expected.push(await Todo.random({ createdAt: now }))
        unexpected.push(await Todo.random({ createdAt: UnixMs.future(now, TimeSpan.days(1)) }))
      }
      unwrap(await f.todoDb.upsert({ entities: [...unexpected, ...expected] }))
      expected.sort(ascend((t) => t.id))
      const before = await f.todoDb.query({
        where: { op: '=', column: 'createdAt', value: now },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 100,
        offset: 0,
      })
      expect(unwrap(before).entities.items).toEqual(expected)
    }
  })

  test('update', async () => {
    for (const f of await Fixtures()) {
      const todo = await Todo.random({ completed: false })

      unwrap(await f.todoDb.upsert({ entities: [todo] }))

      const before = await f.todoDb.query({
        where: { op: '=', column: 'id', value: todo.id },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 1,
        offset: 0,
      })
      const updated = await f.todoDb.update({
        where: { op: '=', column: 'id', value: todo.id },
        set: { completed: true },
        limit: 1,
        offset: 0,
      })
      const after = await f.todoDb.query({
        where: { op: '=', column: 'id', value: todo.id },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 1,
        offset: 0,
      })
      expect(unwrap(before).entities.items[0]?.completed).toEqual(false)
      expect(unwrap(updated)).toEqual(null)
      expect(unwrap(after).entities.items[0]?.completed).toEqual(true)
    }
  })

  test('should filter with in clause', async () => {
    for (const f of await Fixtures()) {
      const matchingTodos = [await Todo.random(), await Todo.random(), await Todo.random()]
      const nonMatchingTodo = await Todo.random()

      unwrap(await f.todoDb.upsert({ entities: [...matchingTodos, nonMatchingTodo] }))

      const result = await f.todoDb.query({
        where: {
          op: 'in',
          column: 'id',
          value: matchingTodos.map((t) => t.id),
        },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 100,
        offset: 0,
      })

      const items = unwrap(result).entities.items
      items.sort(ascend((t) => t.id))
      matchingTodos.sort(ascend((t) => t.id))

      expect(items).toEqual(matchingTodos)
      expect(items.some((item) => item.id === nonMatchingTodo.id)).toEqual(false)
      expect(unwrap(result).entities.total).toEqual(matchingTodos.length)
    }
  })

  test('should return empty result when in clause value is empty', async () => {
    for (const f of await Fixtures()) {
      const todo = await Todo.random()
      unwrap(await f.todoDb.upsert({ entities: [todo] }))

      const result = await f.todoDb.query({
        where: { op: 'in', column: 'id', value: [] },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 100,
        offset: 0,
      })

      expect(unwrap(result).entities.items).toEqual([])
      expect(unwrap(result).entities.total).toEqual(0)
    }
  })

  test('should return empty result when in clause value is empty', async () => {
    for (const f of await Fixtures()) {
      const todo = await Todo.random({ completed: false })
      unwrap(await f.todoDb.upsert({ entities: [todo] }))

      const result = await f.todoDb.query({
        where: {
          op: 'and',
          clauses: [
            { op: '=', column: 'completed', value: false },
            { op: 'in', column: 'id', value: [] },
          ],
        },
        orderBy: [{ column: 'id', direction: 'asc' }],
        limit: 100,
        offset: 0,
      })

      expect(unwrap(result).entities.items).toEqual([])
      expect(unwrap(result).entities.total).toEqual(0)
    }
  })
})
