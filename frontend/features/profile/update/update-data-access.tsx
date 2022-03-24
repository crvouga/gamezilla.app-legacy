import { definitions, supabaseClient } from "../../../data-access";
import { IDataAccess } from "./update-logic";

export const dataAccess: IDataAccess = {
  update: async ({ userId, name, username, avatarUrl }) => {
    const { error } = await supabaseClient
      .from<definitions["profile"]>("profile")
      .update({
        avatar_url: avatarUrl,
        username: username,
        name: name,
      })
      .match({ id: userId });

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
