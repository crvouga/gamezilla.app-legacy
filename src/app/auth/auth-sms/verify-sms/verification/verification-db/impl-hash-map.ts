import { Ok, ascend, descend, eq } from '~/@/core'
import type { Verification, VerificationId } from '..'
import type { IVerificationDb } from './interface'

export type Config = {
  t: 'hash-map'
}

export const VerificationDb = (_config: Config): IVerificationDb => {
  const verifications = new Map<VerificationId, Verification>()

  return {
    async find(input) {
      const filtered = Array.from(verifications.values())
        .filter((v) => {
          if (input.where?.verificationId?.['=']) {
            return input.where?.verificationId?.['='] === v.verificationId
          }
          return true
        })
        .filter((v) => {
          if (input.where?.createdAt?.['<=']) {
            return v.createdAt <= input.where?.createdAt?.['<=']
          }
          return true
        })
        .filter((v) => {
          if (input.where?.createdAt?.['>=']) {
            return v.createdAt >= input.where?.createdAt?.['>=']
          }
          return true
        })
        .filter((v) => {
          if (input.where?.phoneNumber?.['=']) {
            return eq(input.where?.phoneNumber?.['='], v.phoneNumber)
          }
          return true
        })

      switch (input.order?.createdAt) {
        case 'asc': {
          filtered.sort(ascend((v) => v.createdAt))
          break
        }
        case 'desc': {
          filtered.sort(descend((v) => v.createdAt))
          break
        }
      }

      const limit = input.limit ?? Number.POSITIVE_INFINITY
      const offset = input.offset ?? 0
      const sliced = filtered.slice(offset, offset + limit)
      return Ok({
        items: sliced,
        total: filtered.length,
        limit: limit,
        offset: offset
      })
    },
    async put(verification) {
      verifications.set(verification.verificationId, verification)
      return Ok(null)
    }
  }
}
