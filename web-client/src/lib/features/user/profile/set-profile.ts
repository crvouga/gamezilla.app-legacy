import type { definitions } from "../../_supabase";
import { supabaseClient } from "../../_supabase";
import type { IUserId } from "../user";
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
    .eq("user_id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};
