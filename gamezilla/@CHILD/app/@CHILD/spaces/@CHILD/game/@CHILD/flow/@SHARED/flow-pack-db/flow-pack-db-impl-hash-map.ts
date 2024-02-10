import { Result, ok } from "gamezilla/@SHARED/core"
import { FlowPack } from "../flow-pack/flow-pack"
import { IFlowPackDb } from "./flow-pack-db"

const db = new Map<string, FlowPack>()

export const FlowPackDbHashMap = (): IFlowPackDb => {
  return {
    async get(id) {
      await new Promise((r) => setTimeout(r, 500))
      return ok(db.get(id) ?? null)
    },

    async count(input) {
      const listed = await this.list({
        order: { createdAt: "asc" },
        pagination: { limit: 0, offset: 0 },
        where: input.where,
      })

      return Result.mapOk(listed, (l) => l.total)
    },

    async list(input) {
      await new Promise((r) => setTimeout(r, 500))
      const all = Array.from(db.values())
      const filtered = all.filter((pack) =>
        input.where.createdBy ? pack.createdBy === input.where.createdBy : true,
      )
      const sliced = filtered.slice(
        input.pagination.offset,
        input.pagination.offset + input.pagination.limit,
      )
      return ok({
        total: filtered.length,
        items: sliced,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },

    async put(pack) {
      await new Promise((r) => setTimeout(r, 500))
      db.set(pack.id, pack)
      return ok(pack)
    },

    async zap(id) {
      await new Promise((r) => setTimeout(r, 500))
      db.delete(id)
      return ok(null)
    },
  }
}
