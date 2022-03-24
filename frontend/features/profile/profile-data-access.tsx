import { eventChannel } from "redux-saga";
import { definitions, supabaseClient } from "../../data-access";
import { IDataAccess } from "./profile-logic";

export type IProfile = {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  gameRoomId?: string;
};

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

const mapProfile = (profile: IProfile | null) => {
  if (profile) {
    return {
      type: "found",
      profile,
    } as const;
  }
  return {
    type: "not-found",
  } as const;
};

export const dataAccess: IDataAccess = {
  createProfileChan: ({ userId }) =>
    eventChannel((emit) => {
      getProfile({ userId }).then((profile) => {
        emit(mapProfile(profile));
      });

      const subscription = supabaseClient
        .from<definitions["profile"]>(`profile:id=eq.${userId}`)
        .on("INSERT", (payload) => {
          emit(mapProfile(rowToProfile(payload.new)));
        })
        .on("UPDATE", (payload) => {
          emit(mapProfile(rowToProfile(payload.new)));
        })
        .on("DELETE", () => {
          emit({ type: "not-found" });
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }),
};
