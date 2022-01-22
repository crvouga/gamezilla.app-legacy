import { supabaseClient } from "../../shared/supabase";

type AuthStatus =
  | {
      type: "loading";
    }
  | {
      type: "logged-in";
      userId: string;
    }
  | {
      type: "logged-out";
    };

export const onAuthStatus = (set: (state: AuthStatus) => void) => {
  setTimeout(() => {
    const session = supabaseClient.auth.session();
    const userId = session?.user?.id;

    if (userId) {
      set({ type: "logged-in", userId });
      return;
    }

    set({ type: "logged-out" });
  }, 1000 * 1.5);

  const subscription = supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      switch (event) {
        case "PASSWORD_RECOVERY":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          const userId = session?.user?.id;
          if (userId) {
            set({ type: "logged-in", userId });
            return;
          }
          set({ type: "logged-out" });
          return;

        case "SIGNED_OUT":
        case "USER_DELETED":
          set({ type: "logged-out" });
          return;
      }
    }
  );

  return () => {
    subscription.data?.unsubscribe();
  };
};
