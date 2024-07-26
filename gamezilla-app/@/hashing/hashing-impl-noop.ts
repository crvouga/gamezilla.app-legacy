import { HashValue } from './hash-value'
import type { IHashing } from './hashing'

export const Hashing = (): IHashing => {
  // https://bun.sh/docs/api/hashing
  return {
    async hash({ algo, password }) {
      return {
        algo,
        value: HashValue.fromString(password)
      }
    },

    async check({ hash, password }) {
      return hash.value === password
    }
  }
}
