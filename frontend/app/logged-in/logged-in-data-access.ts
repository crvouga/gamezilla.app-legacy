import { definitions, supabaseClient } from "../../data-access";
import { IOnProfile, IProfile } from "./logged-in";

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

export const logout = async () => {
  await supabaseClient.auth.signOut();
};
