import { useQuery } from "react-query";
import { definitions, supabaseClient } from "src/supabase";

type IUser = {
  id: string;
  avatarUrl?: string;
  displayName?: string;
};

type ISearchUsers =
  | {
      type: "loading";
    }
  | {
      type: "success";
      users: IUser[];
    };

const searchUsers = async ({
  searchText,
}: {
  searchText: string;
}): Promise<IUser[]> => {
  const response = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .textSearch("display_name", searchText);

  return (
    response.data?.map((result) => ({
      id: result.id,
      avatarUrl: result.avatar_url,
      displayName: result.display_name,
    })) ?? []
  );
};

export const useSearchUsers = ({
  searchText,
}: {
  searchText: string;
}): ISearchUsers => {
  const query = useQuery(["search", "users", searchText], () =>
    searchUsers({ searchText })
  );

  if (query.data) {
    return {
      type: "success",
      users: query.data,
    };
  }

  return {
    type: "loading",
  };
};
