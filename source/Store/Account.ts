import * as EmailAddress from "../EmailAddress";
import * as Password from "../Password";
import * as Supabase from "../Supabase";
import { Option, Result, Task, pipe } from "../Core";
import { definitions } from "../supabase-types";

//
//
//
// Model
//
//
//

export type Account = {
  userId: string;
  emailAddress?: EmailAddress.EmailAddress;
};

//
//
//
// Data Access
//
//
//

const decodeRow = (
  row: definitions["user_account"],
): Result.Result<Problem, Account> => {
  if (!row.email_address) {
    return Result.Ok({ userId: row.id });
  }

  const emailAddress = EmailAddress.decode(row.email_address);

  if (emailAddress.type === "Err") {
    return Result.Err({
      message: `Failed to decode user from supabase. ${emailAddress.error.message}`,
    });
  }

  return Result.Ok({
    userId: row.id,
    emailAddress: emailAddress.value,
  });
};

export type FindResult = Result.Result<Problem, Option.Option<Account>>;

export const findByEmailAddress =
  ({
    emailAddress,
  }: {
    emailAddress: EmailAddress.EmailAddress;
  }): Task.Task<FindResult> =>
  async () => {
    const response = await Supabase.client
      .from<definitions["user_account"]>("user_account")
      .select("*")
      .eq("email_address", emailAddress);

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    const row = response.data[0];

    if (!row) {
      return Result.Ok(Option.None);
    }

    const decoded = decodeRow(row);

    return pipe(decoded, Result.map(Option.Some));
  };

export type CreateResult = Result.Result<
  Problem,
  Option.Option<{ userId: string }>
>;

export const createWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: EmailAddress.EmailAddress;
    password: Password.Password;
  }): Task.Task<CreateResult> =>
  async () => {
    const response = await Supabase.client.auth.signUp({
      email: emailAddress,
      password: password,
    });

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    //
    //
    //
    // Note!
    // a supabase trigger is expected to insert an row into a public table after sign up
    //
    //
    //

    return Result.Ok(
      pipe(
        Option.fromNullable(response.user),
        Option.map((user) => ({ userId: user.id })),
      ),
    );
  };

export type SendResetPasswordLinkResult = Result.Result<Problem, {}>;

export const sendResetPasswordLink =
  ({
    emailAddress,
  }: {
    emailAddress: string;
  }): Task.Task<SendResetPasswordLinkResult> =>
  async () => {
    const response = await Supabase.client.auth.api.resetPasswordForEmail(
      emailAddress,
    );

    if (response.error) {
      return Result.Err({ message: response.error.message });
    }

    return Result.Ok({});
  };

//
//
//
// Helpers
//
//
//

type Problem = { message: string };
