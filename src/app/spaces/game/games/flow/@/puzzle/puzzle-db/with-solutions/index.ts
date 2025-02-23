import { Ok, isErr, unwrapOr } from '~/@/result'
import { AlgoSolveAsync } from '../../../solutions/algo-solve-async'
import type { IPuzzleDb } from '../interface'
import { ILogger } from '~/@/logger'

export const SKIP_QUERIES = true

export type Config = {
  puzzleDb: IPuzzleDb
  logger: ILogger
}

export const WithSolutions = (config: Config): IPuzzleDb => {
  return {
    ...config.puzzleDb,
    async query(input) {
      const listed = await config.puzzleDb.query(input)

      if (SKIP_QUERIES) {
        return listed
      }

      if (isErr(listed)) return listed

      const promises = listed.value.puzzles.items.map(async (puzzle) => {
        if (puzzle.solutions.length > 0) return puzzle

        const solution = unwrapOr(await AlgoSolveAsync.solve({ model: puzzle.flow, logger: config.logger }), null)

        if (!solution) return puzzle

        const withSolution: typeof puzzle = {
          ...puzzle,
          solutions: [solution],
        }

        return withSolution
      })

      const awaited = await Promise.all(promises)

      return Ok({
        ...listed.value,
        items: awaited,
      })
    },
    async get(id) {
      const got = await config.puzzleDb.get(id)

      if (SKIP_QUERIES) {
        return got
      }

      if (isErr(got)) return got

      if (!got.value) return got

      if (got.value.solutions.length > 0) return got

      const solution = unwrapOr(await AlgoSolveAsync.solve({ model: got.value.flow, logger: config.logger }), null)

      if (!solution) return got

      const withSolution: typeof got.value = {
        ...got.value,
        solutions: [solution],
      }

      return Ok(withSolution)
    },
    async put(puzzle) {
      const solution = unwrapOr(await AlgoSolveAsync.solve({ model: puzzle.flow, logger: config.logger }), null)
      const withSolution: typeof puzzle = {
        ...puzzle,
        solutions: solution ? [solution] : [],
      }
      const output = await config.puzzleDb.put(withSolution)
      return output
    },
  }
}
