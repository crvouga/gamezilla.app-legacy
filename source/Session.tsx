import * as Rx from "rxjs";
import * as Supabase from "./Supabase";

/*


Model


*/

type Session = {
  userId: string;
  defaultName: string;
};

/* 


Update


*/

export const login = () => {
  return new Rx.Observable(() => {
    Supabase.client.auth.signIn({ provider: "google" });
  });
};

export const logout = () => {
  return new Rx.Observable(() => {
    Supabase.client.auth.signOut();
  });
};

/* 


Subscription


*/

export const fromSupabaseSession = (
  session: Supabase.Session | null
): Session | null => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return { userId, defaultName };
  }

  return null;
};

export const subscription = new Rx.Subject<Session | null>();

setTimeout(() => {
  subscription.next(fromSupabaseSession(Supabase.client.auth.session()));
}, 1000);

Supabase.client.auth.onAuthStateChange((_, session) => {
  subscription.next(fromSupabaseSession(session));
});
