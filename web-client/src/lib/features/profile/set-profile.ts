import type { IUserId } from "../users";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";
import type { IAvatarSeed, IAvatarStyle } from "./avatar";
import type { IName } from "./name";

export const setProfile = async ({
  userId,
  avatarSeed,
  avatarStyle,
  name,
}: {
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
  name: IName;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .update({
      avatar_seed: avatarSeed,
      avatar_style: avatarStyle,
      name: name,
    })
    .eq("user_id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};
