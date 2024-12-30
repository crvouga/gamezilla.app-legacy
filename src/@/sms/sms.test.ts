import { describe, expect, it } from 'bun:test'
import { SMS } from './sms-impl'
import { AppServerTestEnv } from '../../app/@/server/server-test-env'
import { Logger } from '../logger'
import { isOk, unwrap } from '~/@/result'
import { PhoneNumber } from '../phone-number'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  const logger = Logger({ t: 'noop' })
  const phoneNumber = unwrap(PhoneNumber.fromString('+14802098698'))
  switch (testEnv.t) {
    case 'all':
    case 'integration': {
      const sms = SMS({
        t: 'fake',
        logger
      })
      return {
        phoneNumber,
        sms
      }
    }
    case 'unit': {
      const sms = SMS({
        t: 'fake',
        logger
      })
      return {
        phoneNumber,
        sms
      }
    }
  }
}

describe(import.meta.file, () => {
  it('should be ok sending sms message', async () => {
    const f = await Fixture()
    const sent = await f.sms.sendMessage({
      message: 'Hello, World!',
      phoneNumber: f.phoneNumber
    })
    expect(isOk(sent)).toBe(true)
  })
})
