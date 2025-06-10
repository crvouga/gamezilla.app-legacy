import { PhoneNumber } from '~/@/phone-number'
import type { Task } from '~/@/promise/task'
import { UnixMs } from '~/@/time/unix-ms'
import type { Paginated } from '~/app/@/data/pagination'
import type { Verification, VerificationId } from '..'

export type WhereClause = {
  verificationId?: {
    '='?: VerificationId
  }
  createdAtUnixMs?: {
    '<='?: UnixMs
    '>='?: UnixMs
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
