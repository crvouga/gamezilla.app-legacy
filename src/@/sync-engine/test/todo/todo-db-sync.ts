import { ISync } from '~/@/sync-engine/sync-transaction'

export const TodoSync: ISync = {
  async push() {
    throw new Error('Not implemented')
  },
  async pull() {
    throw new Error('Not implemented')
  },
}
