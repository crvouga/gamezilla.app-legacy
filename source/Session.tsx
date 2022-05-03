import { pipe } from "fp-ts/lib/function";
import { cmd } from "elm-ts";
import * as Option from "fp-ts/lib/Option";
import * as Task from "fp-ts/lib/Task";
import * as Rx from "rxjs";
import * as Supabase from "./Supabase";

export type Session = {
  userId: string;
  defaultName: string;
};

export const login = <Msg,>(): cmd.Cmd<Msg> => {
  return pipe(
    () => Supabase.client.auth.signIn({ provider: "google" }),
    Task.map((response) => fromSupabaseSession(response.session)),
    Rx.of
  );
};

export const logout = <Msg,>(): cmd.Cmd<Msg> => {
  return pipe(
    () => Supabase.client.auth.signOut(),
    Task.map(() => Option.none),
    Rx.of
  );
};

/* 


Subscription


*/

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

const timeout = setTimeout(() => {
  subscription.next(fromSupabaseSession(Supabase.client.auth.session()));
}, 200);

Supabase.client.auth.onAuthStateChange((_, session) => {
  clearTimeout(timeout);
  subscription.next(fromSupabaseSession(session));
});
