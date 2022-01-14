import React from "react";
import { LoginPage } from "Page/Login";
import { useState } from "react";
import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import { HomePage } from "Page/Home";
import { useEffect } from "react";
import { supabaseClient } from "supabase-client";

type State =
  | {
      type: "loading";
    }
  | {
      type: "logged-in";
    }
  | {
      type: "logged-out";
    };

export const App = () => {
  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    setTimeout(() => {
      const session = supabaseClient.auth.session();
      if (session) {
        setState({ type: "logged-in" });
        return;
      }

      setState({ type: "logged-out" });
    }, 1000 * 1.5);

    supabaseClient.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "PASSWORD_RECOVERY":
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          setState({ type: "logged-in" });
          return;

        case "SIGNED_OUT":
        case "USER_DELETED":
          setState({ type: "logged-out" });
          return;
      }
    });
  }, []);

  if (state.type === "loading") {
    return (
      <BackdropLoader>
        <BackdropLoaderTitle>Loading...</BackdropLoaderTitle>
      </BackdropLoader>
    );
  }

  if (state.type === "logged-out") {
    return <LoginPage />;
  }

  if (state.type === "logged-in") {
    return <HomePage />;
  }
};
