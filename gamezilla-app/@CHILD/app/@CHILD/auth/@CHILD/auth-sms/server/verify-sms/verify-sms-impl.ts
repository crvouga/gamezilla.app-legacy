import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { IVerifySMS } from "./verify-sms"
import * as ImplTest from "./verify-sms-impl-test"
import * as ImplTwilio from "./verify-sms-impl-real"
import { SMS } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { DbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { ICodeGenerator } from "./code-generator"

export type Impl =
  | {
      t: "fake"
      delay: () => Promise<void>
      logger: Logger
    }
  | {
      t: "real"
      logger: Logger
      sms: SMS
      dbConnKv: DbConnKv
      codeGenerator: ICodeGenerator
    }

export const VerifySMS = (impl: Impl): IVerifySMS => {
  switch (impl.t) {
    case "fake": {
      return ImplTest.VerifySMS(impl)
    }

    case "real": {
      return ImplTwilio.VerifySMS(impl)
    }
  }
}
