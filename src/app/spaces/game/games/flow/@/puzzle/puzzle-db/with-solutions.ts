import { Ok, isErr } from '~/@/result'
import { FlowAlgoSolveAsync } from '../../flow/flow/algo/algo-solve-async'
import type { IPuzzleDb } from './interface'

export const SKIP_QUERIES = true

export const WithSolutions = (flowPuzzleDb: IPuzzleDb): IPuzzleDb => {
  return {
    ...flowPuzzleDb,
    async list(input) {
      const listed = await flowPuzzleDb.list(input)

      if (SKIP_QUERIES) {
        return listed
      }

      if (isErr(listed)) return listed

      const promises = listed.value.items.map(async (puzzle) => {
        if (puzzle.solutions.length > 0) return puzzle

        const solution = await FlowAlgoSolveAsync.solve(puzzle.flow)

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
      const got = await flowPuzzleDb.get(id)

      if (SKIP_QUERIES) {
        return got
      }

      if (isErr(got)) return got

      if (!got.value) return got

      if (got.value.solutions.length > 0) return got

      const solution = await FlowAlgoSolveAsync.solve(got.value.flow)

      if (!solution) return got

      const withSolution: typeof got.value = {
        ...got.value,
        solutions: [solution],
      }

      return Ok(withSolution)
    },
    async put(puzzle) {
      const solution = await FlowAlgoSolveAsync.solve(puzzle.flow)
      const withSolution: typeof puzzle = {
        ...puzzle,
        solutions: solution ? [solution] : [],
      }
      const output = await flowPuzzleDb.put(withSolution)
      return output
    },
  }
}
