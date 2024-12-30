import type { Task } from '~/@/promise/task'
import type { Paginated } from '~/app/@/data'
import type { Verification, VerificationId } from '..'
import { Posix } from '~/@/time/posix'
import { PhoneNumber } from '~/@/phone-number'

export type WhereClause = {
  verificationId?: {
    '='?: VerificationId
  }
  createdAtPosix?: {
    '<='?: Posix
    '>='?: Posix
  }
  phoneNumber?: {
    '='?: PhoneNumber
  }
}

export type OrderClause = {
  createdAt?: 'asc' | 'desc'
}

export type IVerificationDb = {
  find(input: {
    where: WhereClause
    order: OrderClause
    limit: number
    offset: number
  }): Task<string, Paginated<Verification>>
  put(verification: Verification): Task<string, null>
  zap(verificationId: VerificationId): Task<string, null>
}
