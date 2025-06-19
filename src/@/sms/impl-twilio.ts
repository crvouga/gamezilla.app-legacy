import { Err } from '~/@/result'
import type { ILogger } from '../logger/interface'
import { PhoneNumber } from '../phone-number'
import type { ISMS } from './interface'

export const SMSTwilio = (config: { logger: ILogger }): ISMS => {
  const logger = config.logger.child(['twilio'])
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
    },
  }
}
