import { Err, isErr, Ok } from '~/@/result'
import { Solutions } from '../../solutions/solutions'
import type { Puzzle } from '../puzzle'
import type { IPuzzleDb } from './interface'

const db = new Map<string, Puzzle>()

const calls = {
  get: 0,
  put: 0,
  zap: 0,
  list: 0,
  count: 0,
}

const ERROR_EVERY = Number.POSITIVE_INFINITY

export const PuzzleDbHashMap = (): IPuzzleDb => {
  return {
    async get(id) {
      calls.get++

      if (calls.get % ERROR_EVERY === 0) {
        return Err('get demo error')
      }

      const puzzle = db.get(id) ?? null
      return Ok(puzzle)
    },

    async count(input) {
      calls.count++
      if (calls.count % ERROR_EVERY === 0) {
        return Err('count demo error')
      }
      const listed = await this.list({
        order: {
          createdAt: 'asc',
        },
        pagination: {
          limit: 0,
          offset: 0,
        },
        where: input.where,
      })

      if (isErr(listed)) {
        return listed
      }

      return Ok(listed.value.puzzles.total)
    },

    async list(input) {
      calls.list++
      if (calls.list % ERROR_EVERY === 0) {
        return Err('list demo error')
      }

      const puzzles = Array.from(db.values())

      const filtered = puzzles.filter((puzzle) => {
        if (input.where.createdBy?.equals && puzzle.createdBy !== input.where.createdBy.equals) {
          return false
        }

        if (input.where.puzzleId?.in && !input.where.puzzleId.in.includes(puzzle.id)) {
          return false
        }

        return true
      })

      const ordered = filtered.sort((a, b) => {
        if (input.order.createdAt === 'asc') {
          return a.createdAt - b.createdAt
        }

        if (input.order.createdAt === 'desc') {
          return b.createdAt - a.createdAt
        }

        if (input.order.lastUpdatedAt === 'asc') {
          return a.lastUpdatedAt - b.lastUpdatedAt
        }

        if (input.order.lastUpdatedAt === 'desc') {
          return b.lastUpdatedAt - a.lastUpdatedAt
        }

        return b.createdAt - a.createdAt
      })

      const sliced = ordered.slice(input.pagination.offset, input.pagination.offset + input.pagination.limit)

      return Ok({
        puzzles: {
          items: sliced,
          total: filtered.length,
          limit: input.pagination.limit,
          offset: input.pagination.offset,
        },
        solutions: Solutions.init,
      })
    },

    async put(input) {
      calls.put++

      if (calls.put % ERROR_EVERY === 0) {
        return Err('put demo error')
      }
      db.set(input.id, input)
      return Ok(null)
    },

    async zap({ id }) {
      calls.zap++
      if (calls.zap % ERROR_EVERY === 0) {
        return Err('zap demo error')
      }
      db.delete(id)
      return Ok(null)
    },
  }
}
