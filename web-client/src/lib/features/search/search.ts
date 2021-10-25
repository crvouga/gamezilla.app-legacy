import type { IAvatarSeed } from "../profile";
import { AvatarStyles, toAvatarSeed, toAvatarStyle } from "../profile";
import type { IUserId } from "../users";
import { toUserId } from "../users";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";

type ISearchResult = {
  type: "profile";
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: AvatarStyles;
};

const rowToSearchResult = (row: definitions["profiles"]): ISearchResult => {
  return {
    type: "profile",
    userId: toUserId(row.user_id),
    avatarSeed: toAvatarSeed(row.avatar_seed),
    avatarStyle: toAvatarStyle(row.avatar_seed),
  };
};

export const search = async ({
  searchText,
}: {
  searchText: string;
}): Promise<{ errors: Error[]; results: ISearchResult[] }> => {
  const response = await supabaseClient
    .from<definitions["profiles"]>("")
    .select()
    .textSearch("user_id", searchText);

  console.log({ response, data: response.data, map: response.data.map });

  // const results = response?.data?.map(rowToSearchResult) ?? [];

  return {
    errors: [new Error(response.error.message ?? "")],
    results: [],
  };
};
