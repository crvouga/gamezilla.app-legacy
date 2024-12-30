import { Err } from '~/@/core'
import type { ILogger } from '../logger/interface'
import type { ISMS } from './sms'
import { Logger } from '../logger'
import { PhoneNumber } from '../phone-number'

export const SMSTwilio = (config: { logger: ILogger }): ISMS => {
  const logger = Logger.prefix('twilio', config.logger)
  return {
    async sendMessage(input) {
      try {
        const phoneNumber = PhoneNumber.toString(input.phoneNumber)
        logger.info(`Sending SMS phoneNumber=${phoneNumber} message=${input.message}`)
        return Err('Not implemented')
      } catch (error) {
        logger.error(`Errored while sending SMS: ${error}`)
        return Err(String(error))
      }
    }
  }
}
