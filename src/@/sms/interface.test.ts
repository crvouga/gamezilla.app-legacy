import { describe, expect, it } from 'vitest'
import { SMS } from './impl'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Logger } from '../logger'
import { isOk, unwrap } from '~/@/result'
import { PhoneNumber } from '../phone-number'

const Fixture = async () => {
  const f = await FixtureAppBackend()
  const logger = Logger({ t: 'noop' })
  const phoneNumber = unwrap(PhoneNumber.fromString('+14802098698'))
  switch (f.t) {
    case 'integration': {
      const sms = SMS({
        t: 'fake',
        logger,
      })
      return {
        phoneNumber,
        sms,
      }
    }
    case 'unit': {
      const sms = SMS({
        t: 'fake',
        logger,
      })
      return {
        phoneNumber,
        sms,
      }
    }
  }
}

describe('SMS', () => {
  it('should be ok sending sms message', async () => {
    const f = await Fixture()
    const sent = await f.sms.sendMessage({
      message: 'Hello, World!',
      phoneNumber: f.phoneNumber,
    })
    expect(isOk(sent)).toBe(true)
  })
})
