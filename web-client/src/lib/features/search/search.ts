import type { IAvatarSeed, IAvatarStyle, IName } from "../profile";
import { toAvatarSeed, toAvatarStyle, toName } from "../profile";
import type { IUserId } from "../users";
import { toUserId } from "../users";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";

export type ISearchResult = {
  type: "profile";
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
  Name: IName;
};

const rowToSearchResult = (row: definitions["profiles"]): ISearchResult => {
  return {
    type: "profile",
    userId: toUserId(row.user_id),
    avatarSeed: toAvatarSeed(row.avatar_seed),
    avatarStyle: toAvatarStyle(row.avatar_style),
    Name: toName(row.name),
  };
};

export const search = async ({
  searchText,
}: {
  searchText: string;
}): Promise<{ errors: Error[]; results: ISearchResult[] }> => {
  const response = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select()
    .ilike("name", `%${searchText}%`);

  const results = response?.data?.map(rowToSearchResult) ?? [];

  const errors = response?.error
    ? [new Error(response.error.message ?? "")]
    : [];

  return {
    errors,
    results,
  };
};
