import type { IDbConnKv } from './db-conn-kv'
import * as DbConnSql from './db-conn-kv-impl-db-conn-sql'
import * as HashMap from './db-conn-kv-impl-hash-map'
import { withCache } from './with-cache'
import { withDistributedUpdates } from './with-distributed-updates'
import { withNamespace } from './with-namespace'
import { withReducedParsing } from './with-reduced-parsing'
import { withThrottledWrites } from './with-throttled-writes'

export type Impl =
  | (HashMap.Config & {
      t: 'hash-map'
    })
  | (DbConnSql.Config & {
      t: 'db-conn-sql'
    })

export const DbConnKv = async (impl: Impl): Promise<IDbConnKv> => {
  switch (impl.t) {
    case 'hash-map': {
      return HashMap.DbConnKv(impl)
    }

    case 'db-conn-sql': {
      return DbConnSql.DbConnKv(impl)
    }
  }
}

DbConnKv.withCache = withCache
DbConnKv.withReducedParsing = withReducedParsing
DbConnKv.withThrottledWrites = withThrottledWrites
DbConnKv.withDistributedUpdates = withDistributedUpdates
DbConnKv.withNamespace = withNamespace
