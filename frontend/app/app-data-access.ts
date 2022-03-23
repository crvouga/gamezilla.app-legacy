import { supabaseClient } from "../data-access";
import { IAuthState, IOnAuthState } from "./app";
import * as LoggedInDataAccess from "./logged-in/logged-in-data-access";
import * as LoggedOutDataAccess from "./logged-out/logged-out-data-access";

export const loggedIn = LoggedInDataAccess;

export const loggedOut = LoggedOutDataAccess;

const getAuthState = (): IAuthState => {
  const session = supabaseClient.auth.session();
  const userId = session?.user?.id;
  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      type: "logged-in",
      userId,
      defaultName,
    };
  }

  return {
    type: "logged-out",
  };
};

export const onAuthState: IOnAuthState = (set) => {
  const timeoutHandler = setTimeout(async () => {
    const authState = await getAuthState();
    set(authState);
  }, 1000 * 1.5);

  const subscription = supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      clearTimeout(timeoutHandler);
      switch (event) {
        case "PASSWORD_RECOVERY":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          const userId = session?.user?.id;
          const defaultName =
            session?.user?.user_metadata?.name ??
            session?.user?.user_metadata?.full_name ??
            "";

          if (userId) {
            set({
              type: "logged-in",
              userId,
              defaultName,
            });
            return;
          }
          set({
            type: "logged-out",
          });
          return;

        case "SIGNED_OUT":
        case "USER_DELETED":
          set({
            type: "logged-out",
          });
          return;
      }
    }
  );

  return () => {
    clearTimeout(timeoutHandler);
    subscription.data?.unsubscribe();
  };
};
