import { Err, Ok, isErr } from '~/@/result'
import type { Verification } from './verification'
import { VerificationAttemptId, type VerificationAttempt } from './verification-attempt'
import type { IVerifySMS } from '../../interface'
import type { Config } from './shared'
import { PhoneNumber } from '~/@/phone-number'

export const VerifyCode =
  (deps: Config): IVerifySMS['verifyCode'] =>
  async (input) => {
    deps.logger.info(`Verifying code for ${PhoneNumber.toString(input.phoneNumber)}`)

    const found = await deps.verificationDb.find({
      where: {
        phoneNumber: {
          '=': input.phoneNumber,
        },
      },
      order: {
        createdAt: 'desc',
      },
      limit: 1,
      offset: 0,
    })

    if (isErr(found)) {
      return Err({
        t: 'database-error',
        error: found.error,
      })
    }

    const verification = found.value.items[0] ?? null

    if (!verification) {
      return Err({
        t: 'verification-not-found',
      })
    }

    if (verification.verifiedAtPosix) {
      return Err({
        t: 'verification-already-verified',
      })
    }

    if (deps.now() >= verification.expiresAtPosix) {
      return Err({
        t: 'verification-expired',
      })
    }

    const foundLatestVerification = await deps.verificationDb.find({
      where: {
        phoneNumber: {
          '=': verification.phoneNumber,
        },
      },
      order: {
        createdAt: 'desc',
      },
      limit: 1,
      offset: 0,
    })

    if (isErr(foundLatestVerification)) {
      return Err({
        t: 'database-error',
        error: foundLatestVerification.error,
      })
    }

    const latestVerification = foundLatestVerification.value.items[0]

    if (latestVerification?.verificationId !== verification.verificationId) {
      return Err({
        t: 'verification-expired-not-latest-verification',
      })
    }

    const verificationId = verification.verificationId
    deps.logger.info(`Checking previous attempts for ${verificationId}`)
    const previousAttempts = await deps.verificationAttemptDb.find({
      where: {
        verificationId: {
          '=': verificationId,
        },
      },
    })

    if (isErr(previousAttempts)) {
      deps.logger.error(`Error checking previous attempts for ${verificationId}`)
      return Err({
        t: 'database-error',
        error: previousAttempts.error,
      })
    }
    deps.logger.info(`Previous attempts for ${verificationId}: ${previousAttempts.value.length}`)

    if (previousAttempts.value.length >= deps.verifyCodeMaxAttempts) {
      return Err({
        t: 'verification-expired-too-many-failed-attempts',
      })
    }

    const codeHash = await deps.hashing.hash({
      algo: {
        t: 'sha256',
      },
      password: input.code,
    })

    const newAttempt: VerificationAttempt = {
      verificationAttemptId: VerificationAttemptId.generate(),
      codeHash,
      createdAt: deps.now(),
      verificationId: verificationId,
    }

    await deps.verificationAttemptDb.insert(newAttempt)

    if (!verification.codeHash) {
      return Err({
        t: 'verification-not-found',
      })
    }

    const isCorrect = await deps.hashing.check({
      hash: verification.codeHash,
      password: input.code,
    })

    if (!isCorrect) {
      return Err({
        t: 'code-incorrect',
      })
    }

    const verificationNew: Verification = {
      ...verification,
      verifiedAtPosix: deps.now(),
    }

    await deps.verificationDb.put(verificationNew)

    return Ok(null)
  }
