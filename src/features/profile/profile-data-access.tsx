import { definitions, supabaseClient } from "../../third-party-services";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
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
      themeMode: data.theme_mode,
    };
  }

  return null;
};

export const createProfile = async ({
  userId,
  name,
  username,
  avatarUrl,
}: {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
}): Promise<
  | {
      type: "success";
      profile: IProfile;
    }
  | {
      type: "error";
      error: Error;
    }
> => {
  const response = await supabaseClient
    .from<definitions["profile"]>("profile")
    .insert({
      id: userId,
      name,
      username,
      avatar_url: avatarUrl,
      theme_mode: "SYSTEM",
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
        themeMode: response.data?.theme_mode,
      },
    };
  }

  return {
    type: "error",
    error: new Error(response.error?.message ?? "Failed to create profile"),
  };
};

export const deleteProfile = async ({ userId }: { userId: string }) => {
  await supabaseClient
    .from<definitions["profile"]>("profile")
    .delete()
    .match({ id: userId });
};

export const onProfile =
  ({ userId }: { userId: string }) =>
  (set: (maybeProfile: IProfile | null) => void) => {
    getProfile({ userId }).then((profile) => {
      if (profile) {
        set(profile);
        return;
      }
      set(null);
    });

    const subscription = supabaseClient
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        set({
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          username: payload.new.username,
          name: payload.new.name,
          themeMode: payload.new.theme_mode,
        });
      })
      .on("UPDATE", (payload) => {
        set({
          userId: payload.new.id,
          avatarUrl: payload.new.avatar_url,
          username: payload.new.username,
          name: payload.new.name,
          themeMode: payload.new.theme_mode,
        });
      })
      .on("DELETE", () => {
        set(null);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

export const updateProfile = async ({
  userId,
  avatarUrl,
  username,
  name,
}: {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: avatarUrl,
      username: username,
      name: name,
    })
    .match({ id: userId });

  if (error) {
    throw error;
  }
};
