import { UnixMs } from '~/@/time/unix-ms'
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
  const hashing = await Hashing({
    t: 'noop',
  })
  const codeHash = await hashing.hash({
    algo: {
      t: 'sha256',
    },
    password: '123',
  })
  return {
    verificationAttemptId: VerificationAttemptId.generate(),
    verificationId: VerificationId.generate(),
    codeHash,
    createdAt: UnixMs.now(),
  }
}

export const VerificationAttempt = {
  random,
}
