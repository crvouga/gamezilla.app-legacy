import { definitions, supabaseClient } from "../../../data-access";
import { IDataAccess } from "./profile-create-interface";

export const dataAccess: IDataAccess = {
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
        type: "error",
      };
    }

    return {
      type: "success",
    };
  },
};
