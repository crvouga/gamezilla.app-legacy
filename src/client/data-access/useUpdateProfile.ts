import { definitions, supabaseClient } from "../../shared/supabase";

export const updateProfile = async ({
  userId,
  avatarUrl,
}: {
  userId: string;
  avatarUrl: string;
}) => {
  await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: avatarUrl,
    })
    .match({ id: userId });
};

export const useUpdateProfile = () => {
  return updateProfile;
};
