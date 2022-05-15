import { either, option, task, taskEither } from "fp-ts";
import * as Rx from "rxjs";
import { sub } from "./Framework";
import * as Supabase from "./Supabase";

//
//
//
// Model
//
//
//

export type Session = { defaultName: string; userId: string };

//
//
//
// Auth
//
//
//

export const login: taskEither.TaskEither<
  { message: string },
  { message: string }
> = async () => {
  const response = await Supabase.client.auth.signIn({ provider: "google" });

  if (response.error) {
    return either.left({ message: response.error.message });
  }

  return either.right({ message: "Successfully logged in" });
};

type Failure = { type: "Failure"; message: string };
type Success = { type: "Success"; message: string };

export const logout =
  (): task.Task<either.Either<Failure, Success>> => async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await Supabase.client.auth.signOut();

    if (response.error) {
      return either.left({ type: "Failure", message: "Failed to logout" });
    }

    return either.right({
      type: "Success",
      message: "Successfully logged out",
    });
  };

export const load: () => task.Task<option.Option<Session>> = () => async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const session = Supabase.client.auth.session();

  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return option.some({ defaultName, userId });
  }

  return option.none;
};

//
//
//
// Supscriptions
//
//
//

export const fromSupabaseSession = (
  session: Supabase.Session | null
): option.Option<Session> => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return option.some({ userId, defaultName });
  }

  return option.none;
};

const subject = new Rx.Subject<option.Option<Session>>();

Supabase.client.auth.onAuthStateChange((_, Auth) => {
  subject.next(fromSupabaseSession(Auth));
});

export const subscriptions = (): sub.Sub<option.Option<Session>> => {
  return subject;
};
