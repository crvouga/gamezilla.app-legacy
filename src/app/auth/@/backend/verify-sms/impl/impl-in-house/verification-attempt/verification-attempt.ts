import { UnixMs } from '~/@/time/posix'
import { type Hash, Hashing } from '~/@/hashing'
import { VerificationAttemptId } from './verification-attempt-id'
import { VerificationId } from '../verification'

export type VerificationAttempt = {
  verificationAttemptId: VerificationAttemptId
  verificationId: VerificationId
  codeHash: Hash
  createdAt: UnixMs
}

const random = async (): Promise<VerificationAttempt> => {
  return {
    verificationAttemptId: VerificationAttemptId.generate(),
    verificationId: VerificationId.generate(),
    codeHash: await Hashing({
      t: 'noop',
    }).hash({
      algo: {
        t: 'sha256',
      },
      password: '123',
    }),
    createdAt: UnixMs.now(),
  }
}

export const VerificationAttempt = {
  random,
}
