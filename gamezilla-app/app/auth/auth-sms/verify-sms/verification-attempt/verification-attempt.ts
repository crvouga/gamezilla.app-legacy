import { Posix } from 'gamezilla-app/@/core'
import { type Hash, Hashing } from 'gamezilla-app/@/hashing'
import { VerificationAttemptId } from './verification-attempt-id'
import { VerificationId } from '../verification'

export type VerificationAttempt = {
  verificationAttemptId: VerificationAttemptId
  verificationId: VerificationId
  codeHash: Hash
  createdAt: Posix
}

const random = async (): Promise<VerificationAttempt> => {
  return {
    verificationAttemptId: VerificationAttemptId.generate(),
    verificationId: VerificationId.generate(),
    codeHash: await Hashing({
      t: 'noop'
    }).hash({
      algo: {
        t: 'sha256'
      },
      password: '123'
    }),
    createdAt: Posix.now()
  }
}

export const VerificationAttempt = {
  random
}
