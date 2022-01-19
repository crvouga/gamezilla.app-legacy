import React, { useEffect, useState } from "react";
import { Alert } from "../../Components/Alert";
import { Backdrop } from "../../Components/Backdrop";
import { ModalLoader } from "../../Components/ModalLoader";
import { definitions, supabaseClient } from "../../supabase";
import { LoggedInRoutes } from "./LoggedInRoutes";
import { IRoute } from "./Routes";

type State =
  | {
      type: "error";
    }
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      route: IRoute;
      profile: {
        userId: string;
        avatarUrl?: string;
        displayName?: string;
      };
    };

export const useProfileSubscription = ({ userId }: { userId: string }) => {
  const [state, setState] = useState<State>({ type: "loading" });

  useEffect(() => {
    supabaseClient
      .from<definitions["profile"]>("profile")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setState({ type: "error" });
          return;
        }

        if (data) {
          setState({
            type: "loaded",
            route: {
              type: "home",
            },
            profile: {
              userId: data.id,
              avatarUrl: data.avatar_url,
              displayName: data.display_name,
            },
          });
          return;
        }
      });

    const subscription = supabaseClient
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("*", (payload) => {
        setState({
          type: "loaded",
          route: {
            type: "home",
          },
          profile: {
            userId: payload.new.id,
            avatarUrl: payload.new.avatar_url,
            displayName: payload.new.display_name,
          },
        });
      })
      .subscribe();

    subscription.onError = () => {
      setState({ type: "error" });
    };

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
};

export const LoggedInApp = ({ userId }: { userId: string }) => {
  const state = useProfileSubscription({ userId });

  switch (state.type) {
    case "error":
      return (
        <Backdrop>
          <Alert
            className="m-4"
            variant="error"
            title="Error"
            body="Something went wrong when trying to load your profile"
          />
        </Backdrop>
      );

    case "loading":
      return <ModalLoader title="Loading..." />;

    case "loaded":
      const { profile } = state;
      return <LoggedInRoutes profile={profile} />;
  }
};
