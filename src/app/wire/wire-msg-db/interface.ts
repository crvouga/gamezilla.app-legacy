import type { Task } from '@/core'

export type IWireMsgDb<TMsg> = {
  add: (msgId: string) => Task<string, null>
  startingFrom: (msgId: string) => Task<string, TMsg[]>
}
