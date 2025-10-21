import { Sub } from '~/@/sub'

export type QueryCacheMsg =
  | {
      t: 'got-entities'
      query: Record<string, unknown>
      entityType: string
      entities: Record<string, Record<string, unknown>>
      results: string[]
      lastUpdatedAtKey: string
    }
  | {
      t: 'got-entity'
      id: string
      entityType: string
      entity: Record<string, unknown>
      lastUpdatedAtKey: string
    }

export const queryCacheMsgs = Sub.queued<QueryCacheMsg>()
