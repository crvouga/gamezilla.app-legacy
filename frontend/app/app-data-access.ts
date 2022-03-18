export { LoggedInDataAccess as loggedIn } from "./logged-in";
export { LoggedOutDataAccess as loggedOut } from "./logged-out";

import { supabaseClient } from "../data-access";
import { IAuthState, IOnAuthState } from "./app";

const getAuthState = async (): Promise<IAuthState> => {
  const session = supabaseClient.auth.session();
  const userId = session?.user?.id;

  if (userId) {
    return {
      type: "logged-in",
      userId,
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
          if (userId) {
            set({
              type: "logged-in",
              userId,
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
