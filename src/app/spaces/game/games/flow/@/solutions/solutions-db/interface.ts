import { Result } from '~/@/result'
import { FlowHash } from '../../flow/hash'
import { Solutions } from '../solutions'

export type ISolutionsDb = {
  get: (hash: FlowHash) => Promise<Result<string, Solutions | null>>
  put: (solutions: Solutions) => Promise<Result<string, null>>
}
