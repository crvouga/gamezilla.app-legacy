import { definitions, supabaseClient } from "../../shared/supabase";

export type IProfile = {
  userId: string;
  username?: string;
  avatarUrl?: string;
  name?: string;
};

const getProfile = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const { data } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return {
      userId: data.id,
      avatarUrl: data.avatar_url,
      username: data.username,
      name: data.name,
    };
  }

  return null;
};

export const createProfile = async ({
  userId,
}: {
  userId: string;
}): Promise<
  { type: "success"; profile: IProfile } | { type: "error"; error: Error }
> => {
  const response = await supabaseClient
    .from<definitions["profile"]>("profile")
    .insert({
      id: userId,
    })
    .single();

  if (response.data?.id) {
    return {
      type: "success",
      profile: {
        userId: response.data?.id,
        avatarUrl: response.data?.avatar_url,
        name: response.data?.name,
        username: response.data?.username,
      },
    };
  }

  return {
    type: "error",
    error: new Error(response.error?.message ?? "Failed to create profile"),
  };
};

type IProfileStatus = {
  type: "loading";
} | {
  type: "found";
  profile: {
    userId: string;
    avatarUrl?: string;
    username?: string;
    name?: string;
  };
} | {
  type: "not-found";
};

export const onProfileStatus = ({ userId }: { userId: string }) =>
  (
    set: (status: IProfileStatus) => void,
  ) => {
    getProfile({ userId }).then((profile) => {
      if (profile) {
        set({
          type: "found",
          profile,
        });
        return;
      }
      set({ type: "not-found" });
    });

    const subscription = supabaseClient
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("DELETE", () => {
        set({ type: "not-found" });
      })
      .on("*", (payload) => {
        set({
          type: "found",
          profile: {
            userId: payload.new.id,
            avatarUrl: payload.new.avatar_url,
            username: payload.new.username,
            name: payload.new.name,
          },
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };
