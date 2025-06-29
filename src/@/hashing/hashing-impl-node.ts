import bcrypt from 'bcrypt'
import argon2 from 'argon2'
import { createHash } from 'crypto'
import { HashValue } from './hash-value'
import type { IHashing } from './hashing'

export const Hashing = (): IHashing => {
  return {
    async hash(input) {
      switch (input.algo.t) {
        case 'bcrypt': {
          const hashedInput = await bcrypt.hash(input.password, input.algo.cost)
          const value = HashValue.fromString(hashedInput)

          return {
            algo: input.algo,
            value,
          }
        }
        case 'argon2d': {
          const hashedInput = await argon2.hash(input.password, {
            type: argon2.argon2d,
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
          const hashedInput = await argon2.hash(input.password, {
            type: argon2.argon2i,
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
          const hashedInput = await argon2.hash(input.password, {
            type: argon2.argon2id,
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
          return argon2.verify(input.hash.value.toString(), input.password)
        case 'bcrypt':
          return bcrypt.compare(input.password, input.hash.value.toString())
        case 'sha256': {
          const hasher = createHash('sha256')
          hasher.update(input.password)
          const hashedInput = hasher.digest('hex')
          return hashedInput === input.hash.value.toString()
        }
      }
    },
  }
}
