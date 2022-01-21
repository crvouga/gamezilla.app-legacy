import { useState } from "react";
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
  const [status, setStatus] = useState<"mutating" | "idle">("idle");

  if (status === "idle") {
    return {
      status,
      async mutate(...params: Parameters<typeof updateProfile>) {
        setStatus("mutating");
        await updateProfile(...params);
        setStatus("idle");
      },
    };
  }

  return {
    status,
  };
};
