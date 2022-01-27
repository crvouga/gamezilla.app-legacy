import { definitions, supabaseClient } from "../../isomorphic/supabase";

type UserStatus =
  | {
      type: "error";
    }
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      profile: {
        userId: string;
        username: string;
        avatarUrl?: string;
      };
    };

export const onUserStatus = ({ userId }: { userId: string }) => (
  set: (state: UserStatus) => void
) => {
  supabaseClient
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single()
    .then(({ data, error }) => {
      if (error) {
        set({ type: "error" });
        return;
      }

      if (data) {
        set({
          type: "loaded",
          profile: {
            userId: data.id,
            avatarUrl: data.avatar_url,
            username:
              data.display_name?.split(" ").join(".").toLowerCase() ??
              "usernamae",
          },
        });
        return;
      }
    });

  const subscription = supabaseClient
    .from<definitions["profile"]>(`profile:id=eq.${userId}`)
    .on("*", (payload) => {
      set({
        type: "loaded",
        profile: {
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          username:
            payload.new.display_name?.split(" ").join(".").toLowerCase() ??
            "username",
        },
      });
    })
    .subscribe();

  subscription.onError = () => {
    set({ type: "error" });
  };

  return () => {
    subscription.unsubscribe();
  };
};
