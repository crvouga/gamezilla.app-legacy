import { RemoteResult } from '~/@/result'
import { SolutionHash } from '../solution-hash/solution-hash'
import { Solutions } from '../solutions'

export type FindSolutionRequest = {
  hash: SolutionHash
  result: RemoteResult<string, { solutions: Solutions }>
}

export type Model = {
  hintCalculator_open: 'find-solutions-confirmation' | null
  hintCalculator_requests: {
    [hash: SolutionHash]: FindSolutionRequest
  }
}
