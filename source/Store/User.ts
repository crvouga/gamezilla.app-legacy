import * as EmailAddress from "EmailAddress";
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

export type User = {
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
): Result.Result<Problem, User> => {
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

export type FindResult = Result.Result<Problem, Option.Option<User>>;

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

    return Result.Err({ message: "Something went wrong." });

    // const row = response.data[0];

    // if (!row) {
    //   return Result.Ok(Option.None);
    // }

    // const decoded = decodeRow(row);

    // return pipe(decoded, Result.map(Option.Some));
  };

//
//
//
// Helpers
//
//
//

type Problem = { message: string };
