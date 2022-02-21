import { definitions, supabaseClient } from "../../third-party-services";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
};

const rowToProfile = (row: definitions["profile"]): IProfile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    themeMode: row.theme_mode,
  };
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
    return rowToProfile(data);
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
      profile: rowToProfile(response.data),
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
        set(rowToProfile(payload.new));
      })
      .on("UPDATE", (payload) => {
        set(rowToProfile(payload.new));
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
