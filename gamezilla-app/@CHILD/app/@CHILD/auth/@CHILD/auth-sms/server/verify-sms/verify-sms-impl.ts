import { Logger } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { IVerifySMS } from "./verify-sms"
import * as ImplTest from "./verify-sms-impl-test"
import * as ImplTwilio from "./verify-sms-impl-twilio"

export type Impl =
  | {
      t: "fake"
      delay: () => Promise<void>
      logger: Logger
    }
  | {
      t: "twilio"
      logger: Logger
    }

export const VerifySMS = (impl: Impl): IVerifySMS => {
  switch (impl.t) {
    case "fake": {
      return ImplTest.VerifySMS(impl)
    }

    case "twilio": {
      return ImplTwilio.VerifySMS()
    }
  }
}
