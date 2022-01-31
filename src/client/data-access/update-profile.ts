import { definitions, supabaseClient } from "../../shared/supabase";

export const updateProfile = async ({
  userId,
  avatarUrl,
}: {
  userId: string;
  avatarUrl: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: avatarUrl,
    })
    .match({ id: userId });

  if (error) {
    throw error;
  }
};
