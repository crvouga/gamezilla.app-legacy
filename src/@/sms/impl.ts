import type { ILogger } from '../logger/interface'
import { SMSFake } from './impl-fake'
import { SMSTwilio } from './impl-twilio'
import type { ISMS } from './interface'

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
  const logger = config.logger.child(['sms'])
  switch (config.t) {
    case 'fake': {
      return SMSFake({ ...config, logger })
    }
    case 'twilio': {
      return SMSTwilio({ ...config, logger })
    }
  }
}
