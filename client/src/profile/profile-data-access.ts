import { definitions, supabaseClient } from "../supabase";
import { IProfile } from "./profile";

export const fetchProfile = async ({
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

export const createProfile = async ({ userId }: { userId: string }) => {
  await supabaseClient.from<definitions["profiles"]>("profiles").insert({
    id: userId,
  });
};

export const fetchElseCreateProfile = async ({
  userId,
}: {
  userId: string;
}) => {
  const fetched = await fetchProfile({ userId });

  if (fetched) {
    return fetched;
  }

  await createProfile({ userId });

  return fetchProfile({ userId });
};
