import { supabaseClient } from "../supabase/supabase-client";
import { auth } from "./auth";

type IEvent =
  | ReturnType<typeof auth.actions.signedIn>
  | ReturnType<typeof auth.actions.signedOut>;

export const onAuthEvents = (emit: (event: IEvent) => void) => {
  const response = supabaseClient.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
      case "USER_UPDATED":
        emit(
          auth.actions.signedIn({
            id: String(session?.user?.id),
            displayName: session?.user?.user_metadata?.name,
            avatarUrl: session?.user?.user_metadata?.photoURL,
          })
        );
        return;
      case "SIGNED_OUT":
      case "USER_DELETED":
        emit(auth.actions.signedOut());
        return;
    }
  });

  return () => {
    response?.data?.unsubscribe();
  };
};
