import { definitions, supabaseClient } from "../../../data-access";

export type IDataAccess = {
  update: (profile: {
    userId: string;
    avatarUrl: string;
    name: string;
    username: string;
  }) => Promise<
    | {
        type: "success";
      }
    | {
        type: "error";
      }
  >;
};

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
