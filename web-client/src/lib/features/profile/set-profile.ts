import type { IUserId } from "../users";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";
import type { IName } from "./name";

export const setProfile = async ({
  userId,
  name,
  avatarUrl,
}: {
  userId: IUserId;
  name: IName;
  avatarUrl?: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
    .update({
      name: name,
      avatar_url: avatarUrl,
    })
    .eq("id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};
