import type { AvatarStyles, IAvatarSeed, IUserId } from "$lib/core";
import { toAvatarSeed, toAvatarStyle, toUserId } from "$lib/core";
import type { definitions } from "$lib/supabase";
import { supabaseClient } from "$lib/supabase";

export type IProfile = {
  avatarSeed: IAvatarSeed;
  avatarStyle: AvatarStyles;
  userId: IUserId;
};

const rowToProfile = (row: definitions["profiles"]): IProfile => {
  return {
    userId: toUserId(row.user_id),
    avatarStyle: toAvatarStyle(row.avatar_style),
    avatarSeed: toAvatarSeed(row.avatar_seed),
  };
};

const getProfile = async ({
  userId,
}: {
  userId: IUserId;
}): Promise<IProfile | null> => {
  const { data } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .eq("user_id", userId);

  if (data.length === 0) {
    return null;
  }

  const [row] = data;

  return rowToProfile(row);
};

export const onProfile = (
  { userId }: { userId: IUserId },
  set: (profile: IProfile) => void,
) => {
  getProfile({ userId }).then((profile) => {
    if (profile) {
      set(profile);
    }
  });

  const subscription = supabaseClient
    .from<definitions["profiles"]>(`profiles:user_id=eq.${userId}`)
    .on("*", (payload) => {
      set(rowToProfile(payload.new));
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
