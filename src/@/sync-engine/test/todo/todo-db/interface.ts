import { Result } from '~/@/result'
import { ITodo } from '../todo'

export type ITodoDb = {
  create: (todo: ITodo) => Promise<Result<string, null>>
  read: () => Promise<Result<string, ITodo[]>>
  update: (todo: Partial<ITodo>) => Promise<Result<string, null>>
  delete: (id: string) => Promise<Result<string, null>>
}
