import { Task } from 'gamezilla-app/@/core'

export type IStream<TValue> = {
  append: (streamId: string, event: TValue) => Task<string, null>
  startingFrom: (streamId: string, fromId: string | null) => Task<string, TValue[]>
}
