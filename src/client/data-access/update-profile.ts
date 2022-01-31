import { definitions, supabaseClient } from "../../shared/supabase";

export const updateProfile = async ({
  userId,
  avatarUrl,
  username,
  name,
}: {
  userId: string;
  avatarUrl?: string;
  username?: string;
  name?: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: avatarUrl,
      username: username,
      name: name,
    })
    .match({ id: userId });

  if (error) {
    throw error;
  }
};
