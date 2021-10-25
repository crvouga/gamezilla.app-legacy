import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";

export const updateProfile = async ({ userId, avatarSeed, avatarStyle }) => {
  const { error } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .update({
      avatar_seed: avatarSeed,
      avatar_style: avatarStyle,
    })
    .eq("user_id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};
