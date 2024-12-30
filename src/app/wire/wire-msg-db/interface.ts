import type { Task } from '~/@/promise/task'

export type IWireMsgDb<TMsg> = {
  add: (msgId: string) => Task<string, null>
  startingFrom: (msgId: string) => Task<string, TMsg[]>
}
