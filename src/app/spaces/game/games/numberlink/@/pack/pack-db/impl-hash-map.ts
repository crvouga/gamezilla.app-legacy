import { Ok, Result, unwrapOr } from '~/@/result'
import { PubSub, Sub } from '~/@/sub'
import type { Pack } from '../pack'
import type { IPackDb } from './interface'
import { PacksDbQuery } from './interface-query'

const db = new Map<string, Pack>()

export type ImplHashMap = {
  t: 'hash-map'
}

const init = (_config: ImplHashMap): IPackDb => {
  const queries = new Map<string, PacksDbQuery>()
  const subs = new Map<string, PubSub<Pack[]>>()

  const list: IPackDb['list'] = async (input) => {
    const all = Array.from(db.values())
    const filtered = all.filter((pack) =>
      input.where.createdBy?.equals ? pack.createdBy === input.where.createdBy.equals : true,
    )
    const sliced = filtered.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)
    return Ok({
      total: filtered.length,
      items: sliced,
      limit: input.pagination.limit,
      offset: input.pagination.offset,
    })
  }

  const notify = async () => {
    for (const query of queries.values()) {
      const queryKey = PacksDbQuery.toKey(query)
      const sub = subs.get(queryKey)
      if (sub) {
        const listed = unwrapOr(await list(query), {
          total: 0,
          items: [],
          limit: query.pagination.limit,
          offset: query.pagination.offset,
        })
        sub.pub(listed.items)
      }
    }
  }
  return {
    async get(id) {
      return Ok(db.get(id) ?? null)
    },

    sub(input) {
      const queryKey = PacksDbQuery.toKey(input)
      queries.set(queryKey, input)
      const sub = subs.get(queryKey) ?? Sub.create()
      subs.set(queryKey, sub)
      return sub
    },

    async count(input) {
      const query: PacksDbQuery = {
        order: { createdAt: 'asc' },
        pagination: { limit: 0, offset: 0 },
        where: input.where,
      }

      const listed = await this.list(query)

      return Result.mapOk(listed, (l) => l.total)
    },

    async list(input) {
      const all = Array.from(db.values())
      const filtered = all.filter((pack) =>
        input.where.createdBy?.equals ? pack.createdBy === input.where.createdBy.equals : true,
      )
      const sliced = filtered.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)
      return Ok({
        total: filtered.length,
        items: sliced,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },

    async put(pack) {
      db.set(pack.id, pack)
      await notify()
      return Ok(pack)
    },

    async zap({ id }) {
      db.delete(id)
      await notify()
      return Ok(null)
    },
  }
}

export const ImplHashMap = {
  init,
}
