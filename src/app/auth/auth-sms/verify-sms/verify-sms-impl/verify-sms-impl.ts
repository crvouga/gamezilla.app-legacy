import { Logger } from '~/app/@/server/logger'
import type { IVerifySMS } from '../verify-sms'
import * as ImplFake from './verify-sms-impl-fake'
import * as ImplFakeAlwaysOk from './verify-sms-impl-fake-always-ok'
import * as ImplInHouse from './verify-sms-impl-in-house'
import * as ImplTwilio from './verify-sms-impl-twilio'

export type Config = ImplInHouse.Config | ImplFake.Config | ImplTwilio.Config | ImplFakeAlwaysOk.Config

export const VerifySMS = (config: Config): IVerifySMS => {
  const logger = Logger.prefix('verify-sms', config.logger)
  switch (config.t) {
    case 'fake': {
      return ImplFake.VerifySMS({ ...config, logger })
    }

    case 'fake-always-ok': {
      return ImplFakeAlwaysOk.VerifySMS({ ...config, logger })
    }

    case 'in-house': {
      return ImplInHouse.VerifySMS({ ...config, logger })
    }

    case 'twilio': {
      return ImplTwilio.VerifySMS({ ...config, logger })
    }
  }
}
