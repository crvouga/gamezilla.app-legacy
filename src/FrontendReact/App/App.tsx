import React, { useEffect, useState } from "react";
import { ModalLoader } from "../Components/ModalLoader";
import { supabaseClient } from "../supabase";
import { LoggedInApp } from "./LoggedIn/LoggedInApp";
import { LoggedOutApp } from "./LoggedOut/LoggedOutApp";

type State =
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

// const appMachine = createMachine<Context>({
//   id: "app",
//   initial: "loading",
//   context: {
//     retries: 0,
//   },
//   states: {
//     loading: {
//       on: {
//         LOGGED_IN: "logged-in",
//         LOGGED_OUT: "logged-out",
//       },
//     },
//     "logged-out": {
//       type: "final",
//       initial: "idle",
//       states: {
//         idle: {
//           on: {
//             LOGIN: "try-logging-in",
//           },
//         },
//         "loggin-in": {
//           on: {
//             CANCEL: "idle",
//           },
//         },
//       },
//     },

//     "logged-in": {
//       on: {
//         LOGOUT: "logged-out",
//       },
//       initial: "loading",
//       states: {
//         subscribing: {
//           on: {
//             SUBSCRIBED: "subscribed",
//           },
//         },
//         subscribed: {
//           on: {},
//         },
//       },
//     },
//   },
// });

export const useAuthStateSubscription = () => {
  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    setTimeout(() => {
      const session = supabaseClient.auth.session();
      const userId = session?.user?.id;

      if (userId) {
        setState({ type: "logged-in", userId });
        return;
      }

      setState({ type: "logged-out" });
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
              setState({ type: "logged-in", userId });
              return;
            }
            setState({ type: "logged-out" });
            return;

          case "SIGNED_OUT":
          case "USER_DELETED":
            setState({ type: "logged-out" });
            return;
        }
      }
    );

    return () => {
      subscription.data?.unsubscribe();
    };
  }, []);

  return state;
};

export const App = () => {
  const authState = useAuthStateSubscription();

  switch (authState.type) {
    case "loading":
      return <ModalLoader title="Loading..." />;

    case "logged-in":
      return <LoggedInApp userId={authState.userId} />;

    case "logged-out":
      return <LoggedOutApp />;
  }
};
