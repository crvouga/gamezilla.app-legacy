import { HashValue } from './hash-value'
import type { IHashing } from './hashing'

export const Hashing = (): IHashing => {
  return {
    async hash(input) {
      switch (input.algo.t) {
        case 'bcrypt': {
          const { hash } = await import('bcrypt')
          const hashedInput = await hash(input.password, input.algo.cost)
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
        case 'argon2d': {
          const { hash, argon2d } = await import('argon2')
          const hashedInput = await hash(input.password, {
            type: argon2d,
            memoryCost: input.algo.memoryCost,
            timeCost: input.algo.timeCost,
          })
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
        case 'argon2i': {
          const { hash, argon2i } = await import('argon2')
          const hashedInput = await hash(input.password, {
            type: argon2i,
            memoryCost: input.algo.memoryCost,
            timeCost: input.algo.timeCost,
          })
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
        case 'argon2id': {
          const { hash, argon2id } = await import('argon2')
          const hashedInput = await hash(input.password, {
            type: argon2id,
            memoryCost: input.algo.memoryCost,
            timeCost: input.algo.timeCost,
          })
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
        case 'sha256': {
          const { createHash } = await import('crypto')
          const hasher = createHash('sha256')
          hasher.update(input.password)
          const hashedInput = hasher.digest('hex')
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
      }
    },

    async check(input) {
      switch (input.hash.algo.t) {
        case 'argon2d':
        case 'argon2i':
        case 'argon2id':
          const { verify } = await import('argon2')
          return verify(input.hash.value.toString(), input.password)
        case 'bcrypt':
          const { compare } = await import('bcrypt')
          return compare(input.password, input.hash.value.toString())
        case 'sha256': {
          const { createHash } = await import('crypto')
          const hasher = createHash('sha256')
          hasher.update(input.password)
          const hashedInput = hasher.digest('hex')
          return hashedInput === input.hash.value.toString()
        }
      }
    },
  }
}
