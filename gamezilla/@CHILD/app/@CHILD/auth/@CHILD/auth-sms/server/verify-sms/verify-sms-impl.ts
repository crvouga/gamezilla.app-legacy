import { Logger } from "gamezilla/@CHILD/app/@SHARED/server/logger"
import { IVerifySMS } from "./verify-sms"
import * as ImplTest from "./verify-sms-impl-test"
import * as ImplTwilio from "./verify-sms-impl-twilio"

export const VerifySMS = ({
    impl,
    logger,
}: {
    impl: "test" | "twilio"
    logger: Logger
}): IVerifySMS => {
    switch (impl) {
        case "test": {
            return ImplTest.VerifySMS({
                logger,
            })
        }
        case "twilio": {
            return ImplTwilio.VerifySMS()
        }
    }
}
