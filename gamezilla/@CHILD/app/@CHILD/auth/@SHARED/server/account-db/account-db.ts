import { EmailAddress, PhoneNumber, Result } from "gamezilla/@SHARED/core"
import { Account } from "../../../auth.core"

export type IAccountDb = {
    findOneByEmail: (input: {
        emailAddress: EmailAddress
    }) => Promise<Result<string, Account | null>>
    findOneByPhoneNumber: (input: {
        phoneNumber: PhoneNumber
    }) => Promise<Result<string, Account | null>>
    insertOne: (input: { account: Account }) => Promise<Result<string, null>>
}
