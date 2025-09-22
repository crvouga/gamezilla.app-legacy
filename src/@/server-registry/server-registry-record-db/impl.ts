import { ImplSqlDb } from './impl-sql-db'
import { ImplSrcUrl } from './impl-src-url'
import { IServerRegistryRecordDb } from './interface'

export type ServerRegistryRecordDb = ImplSqlDb | ImplSrcUrl

const init = (self: ServerRegistryRecordDb): IServerRegistryRecordDb => {
  const logger = self.logger.child(['server-registry-record-db'])
  switch (self.t) {
    case 'sql-db':
      return ImplSqlDb.init({ ...self, logger })
    case 'src-url':
      return ImplSrcUrl.init({ ...self, logger })
  }
}

export const ServerRegistryRecordDb = {
  init,
}
