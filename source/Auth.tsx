import { pipe } from "fp-ts/lib/function";
import * as Option from "fp-ts/lib/Option";
import * as Task from "fp-ts/lib/Task";
import * as Rx from "rxjs";
import { cmd } from "./Framework";
import * as Supabase from "./Supabase";

export type Session = {
  userId: string;
  defaultName: string;
};

export type Model =
  | {
      type: "Loading";
    }
  | {
      type: "NotFound";
    }
  | {
      type: "Found";
      session: Session;
    };

export const init: Model = { type: "Loading" };

export const login = <Msg,>(): cmd.Cmd<Msg> => {
  return pipe(
    () => Supabase.client.auth.signIn({ provider: "google" }),
    Task.map((response) => fromSupabaseSession(response.session)),
    Rx.of
  );
};

export const logout = <Msg,>(): cmd.Cmd<Msg> => {
  return pipe(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Supabase.client.auth.signOut();
    },
    Task.map(() => Option.none),
    Rx.of
  );
};

export const fetch = <Msg,>({
  onSuccess,
  onFailure,
}: {
  onSuccess: (session: Session) => Msg;
  onFailure: () => Msg;
}): cmd.Cmd<Msg> => {
  return pipe(
    Supabase.client.auth.session(),
    Task.of,
    Task.map(fromSupabaseSession),
    Task.map(Option.fold(onFailure, onSuccess)),
    Task.map(Option.some),
    Rx.of
  );
};

export const fromSupabaseSession = (
  session: Supabase.Session | null
): Option.Option<Session> => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return Option.some({ userId, defaultName });
  }

  return Option.none;
};

export const subscription = new Rx.Subject<Option.Option<Session>>();

Supabase.client.auth.onAuthStateChange((_, Auth) => {
  subscription.next(fromSupabaseSession(Auth));
});
