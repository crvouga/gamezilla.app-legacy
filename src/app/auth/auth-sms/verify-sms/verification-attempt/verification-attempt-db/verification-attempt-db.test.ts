import { describe, expect, it } from 'bun:test'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { VerificationAttempt } from '../verification-attempt'
import { VerificationAttemptDb } from './verification-attempt-db-impl'
import { unwrap } from '~/@/result'
import { VerificationId } from '../../verification/verification-id'

const Fixture = async () => {
  const f = await FixtureAppBackend()

  switch (f.t) {
    case 'integration': {
      return {
        verificationAttemptDb: VerificationAttemptDb({
          t: 'postgres',
          dbConnSql: f.dbConnPostgres,
        }),
      }
    }
    case 'unit': {
      return {
        verificationAttemptDb: VerificationAttemptDb({
          t: 'hash-map',
        }),
      }
    }
  }
}

describe(import.meta.file, () => {
  it('should be ok after inserting', async () => {
    const f = await Fixture()
    const verificationAttempt = await VerificationAttempt.random()
    const result = await f.verificationAttemptDb.insert(verificationAttempt)
    expect(result.t).toBe('ok')
  })

  it('should insert correctly', async () => {
    const f = await Fixture()
    const verificationAttempt = await VerificationAttempt.random()
    const before = await f.verificationAttemptDb.find({
      where: {
        verificationId: {
          '=': verificationAttempt.verificationId,
        },
      },
    })
    await f.verificationAttemptDb.insert(verificationAttempt)
    const after = await f.verificationAttemptDb.find({
      where: {
        verificationId: {
          '=': verificationAttempt.verificationId,
        },
      },
    })
    expect(unwrap(before)[0] ?? null).toBe(null)
    expect(unwrap(after)[0]).toEqual(verificationAttempt)
  })

  it('should find correctly', async () => {
    const f = await Fixture()
    const verificationAttempt = await VerificationAttempt.random()
    await f.verificationAttemptDb.insert(verificationAttempt)
    const result = await f.verificationAttemptDb.find({
      where: {
        verificationId: {
          '=': verificationAttempt.verificationId,
        },
      },
    })
    expect(unwrap(result)[0]).toEqual(verificationAttempt)
  })

  it('should not find when verificationId is not equal', async () => {
    const f = await Fixture()
    const verificationAttempt = await VerificationAttempt.random()
    await f.verificationAttemptDb.insert(verificationAttempt)
    const result = await f.verificationAttemptDb.find({
      where: {
        verificationId: {
          '=': VerificationId.generate(),
        },
      },
    })
    expect(unwrap(result)[0] ?? null).toBe(null)
  })
})
