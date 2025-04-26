import type { Task } from '~/@/promise/task'
import type { VerificationId } from '../../verification/verification-id'
import type { VerificationAttempt } from '../verification-attempt'

export type WhereClause = {
  verificationId?: {
    '='?: VerificationId
  }
}

export type IVerificationAttemptDb = {
  find(input: {
    where: {
      verificationId?: {
        '=': VerificationId
      }
    }
  }): Task<string, VerificationAttempt[]>
  insert(attempt: VerificationAttempt): Task<string, null>
}
