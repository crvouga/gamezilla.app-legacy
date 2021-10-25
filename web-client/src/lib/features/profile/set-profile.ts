import type { IUserId } from "../users";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";
import type { AvatarStyles, IAvatarSeed } from "./avatar";
import type { ISearchName } from "./search-name";

export const setProfile = async ({
  userId,
  avatarSeed,
  avatarStyle,
  searchName,
}: {
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: AvatarStyles;
  searchName: ISearchName;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .update({
      avatar_seed: avatarSeed,
      avatar_style: avatarStyle,
      search_name: searchName,
    })
    .eq("user_id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};
