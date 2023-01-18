import { Option, p, Result, Task, Unit } from "@gamezilla/core"
import { EmailAddress, Password, UserId } from "@gamezilla/shared"
import { client, definitions } from "@gamezilla/shared"


//
//
//
// Model
//
//
//

export type Account = {
  userId: UserId
  emailAddress?: EmailAddress
}

//
//
//
// Data Access
//
//
//

const decodeRow = (
  row: definitions["user_account"],
): Result<Problem, Account> => {
  const decodedUserId = UserId.decode(row.id)

  if (decodedUserId.type === "Err") {
    return decodedUserId
  }

  const userId = decodedUserId.value

  if (!row.email_address) {
    return Result.Ok({ userId })
  }

  const emailAddress = EmailAddress.decode(row.email_address)

  if (emailAddress.type === "Err") {
    return Result.Err(
      `Failed to decode user from supabase. ${emailAddress.error}`,
    )
  }

  return Result.Ok({
    userId,
    emailAddress: emailAddress.value,
  })
}

export type FindResult = Result<Problem, Option<Account>>

export const findByEmailAddress =
  ({ emailAddress }: { emailAddress: EmailAddress }): Task<FindResult> =>
    async () => {
      const response = await client
        .from<definitions["user_account"]>("user_account")
        .select("*")
        .eq("email_address", emailAddress)

      if (response.error) {
        return Result.Err(response.error.message)
      }

      const row = response.data[0]

      if (!row) {
        return Result.Ok(Option.None)
      }

      const decoded = decodeRow(row)

      return p(decoded, Result.map(Option.Some))
    }

export type CreateResult = Result<Problem, Option<{ userId: UserId }>>

export const createWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: EmailAddress
    password: Password
  }): Task<CreateResult> =>
    async () => {
      const response = await client.auth.signUp({
        email: emailAddress,
        password: password,
      })

      if (response.error) {
        return Result.Err(response.error.message)
      }

      //
      //
      //
      // Note!
      // a supabase trigger is expected to insert a row into a public table after sign up
      //
      //
      //

      const user = response.user

      if (!user) {
        return Result.Err("failed to create user")
      }

      const userIdResult = UserId.decode(user.id)

      if (userIdResult.type === "Err") {
        return userIdResult
      }

      return Result.Ok(Option.Some({ userId: userIdResult.value }))
    }

export type SendResetPasswordLinkResult = Result<Problem, Unit>

export const sendResetPasswordLink =
  ({
    emailAddress,
  }: {
    emailAddress: string
  }): Task<SendResetPasswordLinkResult> =>
    async () => {
      const response = await client.auth.api.resetPasswordForEmail(
        emailAddress,
      )

      if (response.error) {
        return Result.Err(response.error.message)
      }

      return Result.Ok(Unit)
    }

//
//
//
// Helpers
//
//
//

type Problem = string
