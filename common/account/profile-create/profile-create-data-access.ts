import { definitions, supabaseClient } from "../../infrastructure/supabase";

export type IProfileCreateDataAccess = {
  create: (profile: {
    userId: string;
    avatarUrl: string;
    name: string;
    username: string;
  }) => Promise<{ type: "succeeded" } | { type: "failed" }>;
};

export const dataAccess: IProfileCreateDataAccess = {
  create: async ({ userId, name, username, avatarUrl }) => {
    const { error } = await supabaseClient
      .from<definitions["profile"]>("profile")
      .insert({
        id: userId,
        name,
        username,
        avatar_url: avatarUrl,
        theme_mode: "SYSTEM",
      })
      .single();

    if (error) {
      return {
        type: "failed",
      };
    }

    return {
      type: "succeeded",
    };
  },
};
