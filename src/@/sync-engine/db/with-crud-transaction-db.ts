// @ts-nocheck
import { IDb } from '~/@/db/interface'
import { Err } from '~/@/result'
import { ICrudTransactionDb } from '../crud-transaction-db/interface'

export const WithCrudTransactionDb = (config: {
  db: IDb.IDb<any, any>
  crudTransaction: ICrudTransactionDb
  collection: string
}): IDb.IDb<any, any> => {
  return {
    ...config.db,
    async delete(input) {
      config.crudTransaction.push({
        entries: [
          {
            op: 'delete',
            collection: config.collection,
            id: input.where?.id,
            newData: null,
            prevData: null,
          },
        ],
        id: input.id,
        sessionId: input.sessionId,
        clientSessionId: input.clientSessionId,
        committed: false,
        committedAtUnixMs: 0,
      })
      return Err({ message: 'Not implemented' })
    },
    async upsert(_input) {
      config.crudTransaction.push({
        entries: [
          {
            op: 'upsert',
            collection: config.collection,
            id: _input.entities[0].id,
            newData: _input.entities[0].newData,
            prevData: _input.entities[0].prevData,
          },
        ],
        id: _input.entities[0].id,
        sessionId: _input.entities[0].sessionId,
        clientSessionId: _input.entities[0].clientSessionId,
        committed: false,
        committedAtUnixMs: 0,
      })
      return Err({ message: 'Not implemented' })
    },
    update(input) {
      config.crudTransaction.push({
        entries: [
          {
            op: 'update',
            collection: config.collection,
            id: input.where?.id,
            newData: input.set,
            prevData: null,
          },
        ],
        id: input.id,
        sessionId: input.sessionId,
        clientSessionId: input.clientSessionId,
        committed: false,
        committedAtUnixMs: 0,
      })
      return Err({ message: 'Not implemented' })
    },
  }
}
