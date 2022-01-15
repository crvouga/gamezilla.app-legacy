import { useEffect, useState } from "react";
import { definitions, supabaseClient } from "supabase";

type State =
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      profile: { userId: string; avatarUrl?: string; displayName?: string };
    };

export const useProfile = ({ userId }: { userId: string }) => {
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
  return state;
};
