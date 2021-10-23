import type { definitions } from "$lib/supabase";
import { supabaseClient } from "$lib/supabase";

export const changeAvatar = async ({ userId, avatarSeed, avatarStyle }) => {
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
