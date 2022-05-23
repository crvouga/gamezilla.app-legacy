import { either, option, task } from "fp-ts";
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

export const login: task.Task<either.Either<{}, {}>> = async () => {
  const { error } = await Supabase.client.auth.signIn({ provider: "google" });

  if (error) {
    return either.left({});
  }

  return either.right({});
};

export const logout: task.Task<either.Either<{}, {}>> = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { error } = await Supabase.client.auth.signOut();

  if (error) {
    return either.left({});
  }

  return either.right({});
};

export const load: task.Task<option.Option<Session>> = async () => {
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

const subject = new Rx.Subject<option.Option<Session>>();

const timeout = setTimeout(() => {
  load().then(subject.next);
}, 100);

Supabase.client.auth.onAuthStateChange((_, supabaseSession) => {
  clearTimeout(timeout);
  subject.next(fromSupabaseSession(supabaseSession));
});

export const subscribe = (): sub.Sub<option.Option<Session>> => {
  return subject;
};

//
//
//
// helpers
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
