import { describe, expect, test } from '~/@/test-runner'
import { SMS } from './impl'
import { FixtureAppBackend } from '~/app/@/backend/fixture'
import { Logger } from '../logger'
import { isOk, unwrap } from '~/@/result'
import { PhoneNumber } from '../phone-number'

const Fixture = async () => {
  const f = await FixtureAppBackend()
  const logger = Logger.init({ t: 'noop' })
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
  test('should be ok sending sms message', async () => {
    const f = await Fixture()
    const sent = await f.sms.sendMessage({
      message: 'Hello, World!',
      phoneNumber: f.phoneNumber,
    })
    expect(isOk(sent)).toEqual(true)
  })
})
