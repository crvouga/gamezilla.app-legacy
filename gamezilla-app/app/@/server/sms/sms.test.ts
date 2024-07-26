import { describe, expect, it } from 'bun:test'
import { SMS } from './sms-impl'
import { AppServerTestEnv } from '../server-test-env'
import { Logger } from '../logger'
import { PhoneNumber, isOk, unwrap } from 'gamezilla-app/@/core'

const Fixture = async () => {
  const testEnv = await AppServerTestEnv()
  const logger = Logger({ t: 'noop' })
  const phoneNumber = unwrap(PhoneNumber.fromString('+14802098698'))
  switch (testEnv.t) {
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
