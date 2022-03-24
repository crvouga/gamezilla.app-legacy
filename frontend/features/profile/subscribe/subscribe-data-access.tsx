import { eventChannel } from "redux-saga";
import { definitions, supabaseClient } from "../../../data-access";
import { IDataAccess, IProfile } from "./subscribe-logic";

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
