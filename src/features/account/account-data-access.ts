import { supabaseClient } from "../../third-party-services";
import { IAuthStatus, ILogin } from "./account-data";

export const login = async ({ provider }: ILogin) => {
  const redirectTo = window.location.href;

  await supabaseClient.auth.signIn(
    {
      provider,
    },
    {
      redirectTo: redirectTo,
    }
  );
};

export const logout = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  supabaseClient.auth.signOut();
};

export const getAuthStatus = async (): Promise<IAuthStatus> => {
  const session = supabaseClient.auth.session();
  const userId = session?.user?.id;

  if (userId) {
    return {
      type: "logged-in",
      userId,
      userMetadata: {
        name: session.user?.user_metadata["full_name"],
      },
    };
  }

  return {
    type: "logged-out",
  };
};

export const onAuthStatus = (set: (state: IAuthStatus) => void) => {
  setTimeout(async () => {
    const authStatus = await getAuthStatus();
    set(authStatus);
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
            set({
              type: "logged-in",
              userId,
              userMetadata: {
                name: session.user?.user_metadata["display_name"],
              },
            });
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
