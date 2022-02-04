import { supabaseClient } from "../../shared/supabase";

export type IUserMetadata = {
  name?: string;
};

export type IAuthStatus =
  | {
    type: "loading";
  }
  | {
    type: "logged-in";
    userId: string;
    userMetadata: IUserMetadata;
  }
  | {
    type: "logged-out";
  };

export const getAuthStatus = async (): Promise<IAuthStatus> => {
  const session = supabaseClient.auth.session();
  const userId = session?.user?.id;

  if (userId) {
    console.log({ "session.user": session.user });
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
    },
  );

  return () => {
    subscription.data?.unsubscribe();
  };
};
