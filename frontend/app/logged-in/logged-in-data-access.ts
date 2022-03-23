import { definitions, supabaseClient } from "../../data-access";
import {
  ICreateProfile,
  IOnProfile,
  IProfile,
  IUpdateProfile,
} from "./logged-in";

const rowToProfile = (row: definitions["profile"]): IProfile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    themeMode: row.theme_mode,
    gameRoomId: row.game_room_id,
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

export const onProfile: IOnProfile =
  ({ userId }) =>
  (set) => {
    getProfile({ userId }).then((profile) => {
      if (profile) {
        set({ type: "found", profile });
        return;
      }
      set({ type: "not-found" });
    });

    const subscription = supabaseClient
      .from<definitions["profile"]>(`profile:id=eq.${userId}`)
      .on("INSERT", (payload) => {
        set({
          type: "found",
          profile: rowToProfile(payload.new),
        });
      })
      .on("UPDATE", (payload) => {
        set({
          type: "found",
          profile: rowToProfile(payload.new),
        });
      })
      .on("DELETE", () => {
        set({
          type: "not-found",
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

export const logout = async () => {
  await supabaseClient.auth.signOut();
};

export const createProfile: ICreateProfile = async ({
  userId,
  name,
  username,
  avatarUrl,
}) => {
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
    errors: [
      {
        message: response.error?.message ?? "Failed to create profile",
      },
    ],
  };
};

export const updateProfile: IUpdateProfile = async ({
  userId,
  name,
  username,
  avatarUrl,
}) => {
  const response = await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      name,
      username,
      avatar_url: avatarUrl,
    })
    .match({ id: userId })
    .single();

  if (response.data?.id) {
    return {
      type: "success",
      profile: rowToProfile(response.data),
    };
  }

  return {
    type: "error",
    errors: [
      {
        message: response.error?.message ?? "Failed to update profile",
      },
    ],
  };
};
