import { RemoteResult } from '~/@/result'
import { Solutions } from '../solutions'
import { SolutionHash } from '../solution-hash/solution-hash'

export type ModelFrontend = {
  requests: {
    [hash: SolutionHash]: {
      hash: SolutionHash
      result: RemoteResult<string, { solutions: Solutions }>
    }
  }
}

export type MsgFrontend = { t: 'clicked-find-solutions'; hash: SolutionHash }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgInCmdFrontend = {
  t: 'solutions-finder-query'
  c: { t: 'got-msg'; msg: MsgFrontend }
}
