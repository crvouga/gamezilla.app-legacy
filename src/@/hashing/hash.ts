import { s } from '~/@/schema'
import { HashValue } from './hash-value'
import { HashingAlgo } from './hashing-algo'

export const Hash = s.obj({
  value: HashValue,
  algo: HashingAlgo,
})
export type Hash = s.Infer<typeof Hash>
