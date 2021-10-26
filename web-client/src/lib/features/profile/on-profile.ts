import type { IAvatarSeed, IAvatarStyle, IUserId } from "$lib/features";
import { toAvatarSeed, toAvatarStyle, toUserId } from "$lib/features";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";
import type { IName } from "./name";
import { toName } from "./name";

export type IProfile = {
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
  name: IName;
  userId: IUserId;
};

const rowToProfile = (row: definitions["profiles"]): IProfile => {
  return {
    userId: toUserId(row.user_id),
    avatarStyle: toAvatarStyle(row.avatar_style),
    avatarSeed: toAvatarSeed(row.avatar_seed),
    name: toName(row.name),
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
