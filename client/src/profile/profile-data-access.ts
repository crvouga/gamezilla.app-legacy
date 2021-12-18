import { definitions, supabaseClient } from "../supabase";
import { IProfile } from "./profile";

const fetch = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const response = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (response.data) {
    return {
      userId: response.data.id,
      avatarUrl: response.data.avatar_url,
      displayName: response.data.display_name,
    };
  }

  return null;
};

const create = async ({ userId }: { userId: string }) => {
  await supabaseClient.from<definitions["profiles"]>("profiles").insert({
    id: userId,
  });
};

const fetchElseCreate = async ({ userId }: { userId: string }) => {
  const fetched = await fetch({ userId });

  if (fetched) {
    return fetched;
  }

  await create({ userId });

  return fetch({ userId });
};

export const profileDataAccess = {
  fetchElseCreate,
  fetch,
  create,
};
