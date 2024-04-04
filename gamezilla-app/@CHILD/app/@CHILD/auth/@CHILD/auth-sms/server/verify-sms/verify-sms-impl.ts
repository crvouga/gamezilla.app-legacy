import { SMS } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { ICodeGenerator } from "./code-generator"
import { IVerifySMS } from "./verify-sms"
import * as ImplReal from "./verify-sms-impl-real"
import * as ImplFake from "./verify-sms-impl-test"

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
      dbConnKv: IDbConnKv
      codeGenerator: ICodeGenerator
    }

export const VerifySMS = (impl: Impl): IVerifySMS => {
  switch (impl.t) {
    case "fake": {
      return ImplFake.VerifySMS(impl)
    }

    case "real": {
      return ImplReal.VerifySMS(impl)
    }
  }
}
