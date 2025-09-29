import { Db } from '~/@/db/impl/impl'
import { ILogger } from '~/@/logger'
import { ITodoDb } from './interface'

export type ImplHashMap = {
  t: 'hash-map'
  logger: ILogger
}

const init = (config: ImplHashMap): ITodoDb => {
  return Db.init({
    t: 'hash-map',
    logger: config.logger,
    parser: ITodoDb.schema,
    getRelated: async () => ({}),
    toPrimaryKey: (_entity) => 'id',
    map: (x) => x,
  })
}

export const ImplHashMap = {
  init,
}
