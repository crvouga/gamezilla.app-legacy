import React from "react";
import { LoginPage } from "Page/Login";
import { useState } from "react";
import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import { HomePage } from "Page/Home";
import { useEffect } from "react";
import { definitions, supabaseClient } from "supabase";

const AppLoggedIn = ({ userId }: { userId: string }) => {
  type State =
    | { type: "loading" }
    | {
        type: "loaded";
        profile: { userId: string; avatarUrl?: string; displayName?: string };
      };

  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    const subscription = supabaseClient
      .from<definitions["profile"]>("profile")
      .on("*", (payload) => {
        setState({
          type: "loaded",
          profile: {
            userId: payload.new.id,
            avatarUrl: payload.new.avatar_url,
            displayName: payload.new.display_name,
          },
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  switch (state.type) {
    case "loading":
      return (
        <BackdropLoader>
          <BackdropLoaderTitle>Loading Profile...</BackdropLoaderTitle>
        </BackdropLoader>
      );

    case "loaded":
      return <HomePage />;
  }
};

export const App = () => {
  type State =
    | { type: "loading" }
    | { type: "logged-in"; userId: string }
    | { type: "logged-out" };
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

  switch (state.type) {
    case "loading":
      return (
        <BackdropLoader>
          <BackdropLoaderTitle>Loading...</BackdropLoaderTitle>
        </BackdropLoader>
      );

    case "logged-in":
      return <AppLoggedIn userId={state.userId} />;

    case "logged-out":
      return <LoginPage />;
  }
};
