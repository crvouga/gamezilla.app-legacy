import type { definitions } from "../../_supabase";
import { supabaseClient } from "../../_supabase";
import type { IUserId } from "../user";
import { toUserId } from "../user";
import type { IName } from "./name";
import { toName } from "./name";

export type IProfile = {
  avatarUrl?: string;
  name: IName;
  userId: IUserId;
};

const rowToProfile = (row: definitions["user_profiles"]): IProfile => {
  return {
    userId: toUserId(row.user_id),
    avatarUrl: row.avatar_url,
    name: toName(row.name),
  };
};

const getProfile = async ({
  userId,
}: {
  userId: IUserId;
}): Promise<IProfile | null> => {
  const { data } = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
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
  set: (profile: IProfile) => void
) => {
  getProfile({ userId }).then((profile) => {
    if (profile) {
      set(profile);
    }
  });

  const subscription = supabaseClient
    .from<definitions["user_profiles"]>(`user_profiles:user_id=eq.${userId}`)
    .on("*", (payload) => {
      set(rowToProfile(payload.new));
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
