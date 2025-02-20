import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { FlowHash } from '../../flow/hash'
import { Solutions } from '../solutions'

export type ISolutionsDb = {
  get: (hash: FlowHash) => Promise<Result<string, Solutions | null>>
  put: (solutions: Solutions) => Promise<Result<string, null>>
  zap: (hash: FlowHash) => Promise<Result<string, null>>
  sub: (hash: FlowHash) => Sub<Solutions>
}
