import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'

export type ISolutionsDb = {
  get: (hash: SolutionHash) => Promise<Result<string, Solutions | null>>
  put: (solutions: Solutions) => Promise<Result<string, null>>
  zap: (hash: SolutionHash) => Promise<Result<string, null>>
  sub: (hash: SolutionHash) => Sub<Solutions | null>
}
