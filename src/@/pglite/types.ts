import type { PGlite } from '@electric-sql/pglite'
import type { LiveNamespace } from '@electric-sql/pglite/live'
import type { PGliteWorker } from '@electric-sql/pglite/worker'

export type IPglite = (PGlite & { live: LiveNamespace }) | (PGliteWorker & { live: LiveNamespace })

export type PgliteConfig =
  | {
      t: 'in-memory'
    }
  | {
      t: 'indexed-db'
      databaseName: string
    }
