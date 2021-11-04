import type { IName, IUserId } from "../user";
import { toName, toUserId } from "../user";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";

export type ISearchResult = {
  type: "profile";
  userId: IUserId;
  avatarUrl?: string;
  name: IName;
};

const rowToSearchResult = (
  row: definitions["user_profiles"]
): ISearchResult => {
  return {
    type: "profile",
    userId: toUserId(row.user_id),
    avatarUrl: row.avatar_url,
    name: toName(row.name),
  };
};

export const search = async ({
  searchText,
}: {
  searchText: string;
}): Promise<{ errors: Error[]; results: ISearchResult[] }> => {
  const response = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
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
