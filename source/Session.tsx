import { either, option, task, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as Rx from "rxjs";
import { cmd, sub } from "./Framework";
import { perform } from "./Framework/Task";
import * as Supabase from "./Supabase";

//
//
//
// Model
//
//
//

export type Model =
  | { type: "Loading" }
  | { type: "NotFound" }
  | { type: "Found"; session: Session };

export type Session = { userId: string; defaultName: string };

export const init = (): [Model, cmd.Cmd<Msg>] => [
  { type: "Loading" },
  pipe(load(), perform(option.fold<Session, Msg>(NotFound, Found))),
];

//
//
//
// Update
//
//
//

export type Msg = Found | NotFound;

type Found = { group: "Session"; type: "SessionFound"; session: Session };
type NotFound = { group: "Session"; type: "SessionNotFound" };

const Found = (session: Session): Found => ({
  group: "Session",
  type: "SessionFound",
  session,
});
const NotFound = (): NotFound => ({
  group: "Session",
  type: "SessionNotFound",
});

export const update = (msg: Msg): Model => {
  switch (msg.type) {
    case "SessionFound":
      return { type: "Found", session: msg.session };

    case "SessionNotFound":
      return { type: "NotFound" };
  }
};

//
//
//
// Authentication
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

// export const logout = <Msg,>(): cmd.Cmd<Msg> => {
//   return pipe(
//     async () => {
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       Supabase.client.auth.signOut();
//     },
//     Task.map(() => Option.none),
//     Rx.of
//   );
// };

export const load: () => task.Task<option.Option<Session>> = () => async () => {
  const session = Supabase.client.auth.session();

  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  await new Promise((resolve) => setTimeout(resolve, 1000));

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

export const fromSupabaseSession = (session: Supabase.Session | null): Msg => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      type: "SessionFound",
      group: "Session",
      session: { userId, defaultName },
    };
  }

  return { type: "SessionNotFound", group: "Session" };
};

export const subscription = new Rx.Subject<Msg>();

Supabase.client.auth.onAuthStateChange((_, Auth) => {
  subscription.next(fromSupabaseSession(Auth));
});

export const subscriptions = (): sub.Sub<Msg> => {
  return subscription;
};
