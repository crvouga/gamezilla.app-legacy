import { Logger } from '../logger'
import type { ILogger } from '../logger/interface'
import type { ISMS } from './interface'
import { SMSFake } from './impl-fake'
import { SMSTwilio } from './impl-twilio'

export type SMSImpl =
  | {
      t: 'twilio'
      logger: ILogger
    }
  | {
      t: 'fake'
      logger: ILogger
    }

export const SMS = (config: SMSImpl): ISMS => {
  const logger = Logger.prefix('sms', config.logger)
  switch (config.t) {
    case 'fake': {
      return SMSFake({ ...config, logger })
    }
    case 'twilio': {
      return SMSTwilio({ ...config, logger })
    }
  }
}
