import { Result } from '~/@/result'
import { FlowHash } from '../../flow/hash'
import { Solutions } from '../solutions'

export type ISolutionsDb = {
  find: (hash: FlowHash) => Promise<Result<string, Solutions>>
  put: (solutions: Solutions) => Promise<Result<string, null>>
}
