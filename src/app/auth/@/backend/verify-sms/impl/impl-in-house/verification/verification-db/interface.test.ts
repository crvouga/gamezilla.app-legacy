import { describe, expect, it } from 'bun:test'
import { ascend, descend } from '~/@/array/sorting'
import { Ok, unwrap } from '~/@/result'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Verification } from '../verification'
import { VerificationDb } from './impl'
import { UnixMs } from '~/@/time/unix-ms'
import { TimeSpan } from '~/@/time/time-span'

const FixtureVariant = async () => {
  //
  const f = await FixtureAppBackend()
  switch (f.t) {
    case 'integration': {
      return {
        verificationDb: VerificationDb({
          t: 'sql-db',
          sqlDb: f.sqlDbPostgres,
        }),
      }
    }
    case 'unit': {
      return {
        verificationDb: VerificationDb({
          t: 'hash-map',
        }),
      }
    }
  }
}

const Fixture = async () => {
  const f = await FixtureVariant()
  const inserted: Verification[] = []
  const insertVerifications = async ({ start, end, count = 3 }: { end: UnixMs; count?: number; start: UnixMs }) => {
    const verifications: Verification[] = []

    const timeSpan = TimeSpan.scale(UnixMs.diff(end, start), 1 / count)

    let runningCreatedAt = start

    for (let i = 0; i < count; i++) {
      const verification = await Verification.random({
        createdAt: runningCreatedAt,
      })
      await f.verificationDb.put(verification)
      verifications.push(verification)
      runningCreatedAt = UnixMs.future(runningCreatedAt, timeSpan)
    }

    inserted.push(...verifications)

    return verifications
  }

  const cleanUp = async () => {
    for (const v of inserted) {
      await f.verificationDb.zap(v.verificationId)
    }
  }

  const now = (): UnixMs => {
    return UnixMs.future(UnixMs.now(), TimeSpan.years(10))
  }

  return {
    ...f,
    now,
    cleanUp,
    inserted,
    insertVerifications,
  }
}

type Fixture = Awaited<ReturnType<typeof Fixture>>

describe('Test', () => {
  it('should be ok inserting records', async () => {
    const f = await Fixture()
    const verification = await Verification.random()
    const inserted = await f.verificationDb.put(verification)
    await f.cleanUp()
    expect(inserted).toEqual(Ok(null))
  })

  it('should insert records correctly', async () => {
    const f = await Fixture()
    const verification = await Verification.random()
    const before = await f.verificationDb.find({
      where: {
        verificationId: {
          '=': verification.verificationId,
        },
      },
      limit: 1,
      offset: 0,
      order: {
        createdAt: 'asc',
      },
    })
    await f.verificationDb.put(verification)
    const after = await f.verificationDb.find({
      where: {
        verificationId: {
          '=': verification.verificationId,
        },
      },
      limit: 1,
      offset: 0,
      order: {
        createdAt: 'asc',
      },
    })
    await f.cleanUp()
    expect(unwrap(before).items[0] ?? null).toEqual(null)
    expect(unwrap(after).items[0]).toEqual(verification)
  })

  it('should upsert records correctly', async () => {
    const f = await Fixture()
    const verification = await Verification.random()
    await f.verificationDb.put(verification)
    const before = await f.verificationDb.find({
      where: {
        verificationId: {
          '=': verification.verificationId,
        },
      },
      limit: 1,
      offset: 0,
      order: {
        createdAt: 'asc',
      },
    })
    const verificationNew: Verification = {
      ...verification,
      verifiedAtUnixMs: UnixMs.now(),
    }
    await f.verificationDb.put(verificationNew)
    const after = await f.verificationDb.find({
      where: {
        verificationId: {
          '=': verification.verificationId,
        },
      },
      limit: 1,
      offset: 0,
      order: {
        createdAt: 'asc',
      },
    })
    await f.cleanUp()
    expect(unwrap(before).items[0]).toEqual(verification)
    expect(unwrap(after).items[0]).toEqual(verificationNew)
  })

  it('should find by phone number', async () => {
    const f = await Fixture()
    const verification = await Verification.random()
    await f.verificationDb.put(verification)
    const found = await f.verificationDb.find({
      where: {
        phoneNumber: {
          '=': verification.phoneNumber,
        },
      },
      order: {
        createdAt: 'asc',
      },
      limit: 1000,
      offset: 0,
    })
    await f.cleanUp()
    expect(unwrap(found).items[0]).toEqual(verification)
  })

  it('should find by created at correctly', async () => {
    const f = await Fixture()
    const now = f.now()

    await f.insertVerifications({
      start: UnixMs.past(now, TimeSpan.milliseconds(20)),
      end: UnixMs.past(now, TimeSpan.milliseconds(10)),
    })

    await f.insertVerifications({
      start: UnixMs.future(now, TimeSpan.milliseconds(10)),
      end: UnixMs.future(now, TimeSpan.milliseconds(20)),
    })

    const start = now
    const end = UnixMs.future(now, TimeSpan.milliseconds(3))
    const expected = await f.insertVerifications({
      start,
      end,
      count: 1,
    })

    const found = await f.verificationDb.find({
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'asc',
      },
      limit: 1000,
      offset: 0,
    })
    const actual = unwrap(found).items.sort(ascend((v) => v.createdAtUnixMs))
    await f.cleanUp()
    expect(actual).toEqual(expected.sort(ascend((v) => v.createdAtUnixMs)))
  })

  it('should limit correctly', async () => {
    const f = await Fixture()
    const now = f.now()
    const start = now
    const end = UnixMs.future(now, TimeSpan.milliseconds(1))
    const LIMIT = 5
    const expected = await f.insertVerifications({
      start,
      end,
      count: 1,
    })
    const found = await f.verificationDb.find({
      limit: LIMIT,
      offset: 0,
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'asc',
      },
    })
    const actual = unwrap(found).items
    const expectedIds = new Set(expected.slice(0, LIMIT).map((v) => v.verificationId))
    const actualIds = new Set(actual.map((v) => v.verificationId))
    await f.cleanUp()
    expect(expectedIds).toEqual(actualIds)
  })

  it('should offset correctly', async () => {
    const f = await Fixture()
    const now = f.now()
    const start = now
    const LIMIT = 5
    const OFFSET = 3
    const end = UnixMs.future(now, TimeSpan.milliseconds(10))
    const expected = await f.insertVerifications({
      start,
      end,
      count: 8,
    })

    const found = await f.verificationDb.find({
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'asc',
      },
      offset: OFFSET,
      limit: LIMIT,
    })

    const actual = unwrap(found).items
    await f.cleanUp()
    const sliced = expected.slice(OFFSET, OFFSET + LIMIT)
    const actualIds = new Set(actual.map((v) => v.verificationId))
    const expectedIds = new Set(sliced.map((v) => v.verificationId))
    expect(actualIds).toEqual(expectedIds)
    expect(actual).toEqual(sliced)
  })

  it.todo('should offset and limit correctly', async () => {
    const f = await Fixture()
    const now = f.now()
    const start = now
    const end = UnixMs.future(now, TimeSpan.milliseconds(1))
    const expected = await f.insertVerifications({
      start,
      end,
      count: 6,
    })

    const found = await f.verificationDb.find({
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'desc',
      },
      offset: 3,
      limit: 5,
    })
    const actual = unwrap(found).items
    await f.cleanUp()
    expect(actual).toEqual(expected.slice(3, 8))
  })

  it('should order by asc created at correctly', async () => {
    const f = await Fixture()
    const now = f.now()
    const start = now
    const end = UnixMs.future(now, TimeSpan.milliseconds(10))
    const expected = await f.insertVerifications({
      start,
      end,
      count: 10,
    })

    expected.sort(ascend((v) => v.createdAtUnixMs))

    const found = await f.verificationDb.find({
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'asc',
      },
      limit: 1000,
      offset: 0,
    })

    const actual = unwrap(found).items
    await f.cleanUp()
    expect(actual).toEqual(expected)
  })

  it('should order by desc created at correctly', async () => {
    const f = await Fixture()
    const now = f.now()
    const start = now
    const end = UnixMs.future(now, TimeSpan.milliseconds(10))
    const expected = await f.insertVerifications({
      start,
      end,
      count: 10,
    })

    expected.sort(descend((v) => v.createdAtUnixMs))

    const found = await f.verificationDb.find({
      where: {
        createdAtUnixMs: {
          '<=': end,
          '>=': start,
        },
      },
      order: {
        createdAt: 'desc',
      },
      limit: 1000,
      offset: 0,
    })

    const actual = unwrap(found).items
    await f.cleanUp()
    expect(actual).toEqual(expected)
  })

  it('should allow code hash to be null', async () => {
    const f = await Fixture()
    const verification = await Verification.random({
      codeHash: null,
    })
    const put = await f.verificationDb.put(verification)
    const found = await f.verificationDb.find({
      where: {
        verificationId: {
          '=': verification.verificationId,
        },
      },
      order: {
        createdAt: 'asc',
      },
      limit: 1,
      offset: 0,
    })
    expect(put.t).toBe('ok')
    await f.cleanUp()
    expect(unwrap(found).items[0]).toEqual(verification)
  })
})
