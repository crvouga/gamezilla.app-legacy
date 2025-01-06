import { ascend, descend } from '~/@/array/sorting'
import { Ok } from '~/@/result'
import { eq } from '~/@/equals/equals'
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
          if (input.where?.createdAtPosix?.['<=']) {
            return v.createdAtPosix <= input.where?.createdAtPosix?.['<=']
          }
          return true
        })
        .filter((v) => {
          if (input.where?.createdAtPosix?.['>=']) {
            return v.createdAtPosix >= input.where?.createdAtPosix?.['>=']
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
          filtered.sort(ascend((v) => v.createdAtPosix))
          break
        }
        case 'desc': {
          filtered.sort(descend((v) => v.createdAtPosix))
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
        offset: offset,
      })
    },
    async put(verification) {
      verifications.set(verification.verificationId, verification)
      return Ok(null)
    },
    async zap(verificationId) {
      verifications.delete(verificationId)
      return Ok(null)
    },
  }
}
