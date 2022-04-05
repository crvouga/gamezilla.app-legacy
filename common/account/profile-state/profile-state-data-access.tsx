import { eventChannel } from "redux-saga";
import { definitions, supabaseClient } from "../../infrastructure/supabase";
import * as ProfileUpdate from "../profile-update/profile-update-data-access";
import { actions, IDataAccess, IProfile } from "./profile-state";

const rowToProfile = (row: definitions["profile"]): IProfile => {
  return {
    userId: row.id,
    avatarUrl: row.avatar_url,
    name: row.name,
    username: row.username,
    // themeMode: row.theme_mode,
    // gameRoomId: row.game_room_id,
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

const profileToProfileEvent = (profile: IProfile | null) => {
  if (profile) {
    return actions.found(profile);
  }

  return actions.notFound();
};

export const dataAccess: IDataAccess = {
  profileUpdate: ProfileUpdate.dataAccess,
  createProfileEventChan: ({ userId }) =>
    eventChannel((emit) => {
      getProfile({ userId }).then((profile) => {
        emit(profileToProfileEvent(profile));
      });

      const subscription = supabaseClient
        .from<definitions["profile"]>(`profile:id=eq.${userId}`)
        .on("INSERT", (payload) => {
          emit(profileToProfileEvent(rowToProfile(payload.new)));
        })
        .on("UPDATE", (payload) => {
          emit(profileToProfileEvent(rowToProfile(payload.new)));
        })
        .on("DELETE", () => {
          emit(profileToProfileEvent(null));
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }),
};
