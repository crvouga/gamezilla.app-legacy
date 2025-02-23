import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Solution } from '../solution'
import { SolutionHash } from '../solution-hash/solution-hash'

export type ISolutionsDb = {
  get: (hash: SolutionHash) => Promise<Result<string, Solution[]>>
  put: (solutions: Solution[]) => Promise<Result<string, null>>
  zap: (hash: SolutionHash) => Promise<Result<string, null>>
  sub: (hash: SolutionHash) => Sub<Solution[]>
}
