import * as EmailAddress from "EmailAddress";
import * as Password from "Password";
import * as Supabase from "Supabase";
import { Option, Result, Task, pipe } from "Core";
import { definitions } from "supabase-types";

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

export type CreateResult =
  | { type: "UserAlreadyRegisted" }
  | { type: "SignUpFailed"; message: string }
  | { type: "InsertFailed"; message: string }
  | { type: "Succeeded"; userId: string };

export const createWithEmailAndPassword =
  ({
    emailAddress,
    password,
  }: {
    emailAddress: EmailAddress.EmailAddress;
    password: Password.Password;
  }): Task.Task<CreateResult> =>
  async () => {
    const signUpResponse = await Supabase.client.auth.signUp({
      email: emailAddress,
      password: password,
    });

    if (signUpResponse.error) {
      const UserAlreadyRegistered = "User already registered";
      const message = signUpResponse.error.message;

      if (message === UserAlreadyRegistered) {
        return { type: "UserAlreadyRegisted" };
      }

      return { type: "SignUpFailed", message };
    }

    if (!signUpResponse.user) {
      return {
        type: "InsertFailed",
        message: "sign up response did not return an user id",
      };
    }

    const insertResponse = await Supabase.client
      .from<definitions["user_account"]>("user_account")
      .insert({ id: signUpResponse.user.id, email_address: emailAddress });

    if (insertResponse.error) {
      return {
        type: "InsertFailed",
        message: `Sign up response succeeded but inserting account failed. ${insertResponse.error.message}`,
      };
    }

    return { type: "Succeeded", userId: signUpResponse.user.id };
  };

//
//
//
// Helpers
//
//
//

type Problem = { message: string };
