import { definitions, supabaseClient } from "../../infrastructure/supabase";

export type IDataAccess = {
  delete: (profile: {
    userId: string;
  }) => Promise<{ type: "success" } | { type: "error" }>;
};

export const dataAccess: IDataAccess = {
  delete: async ({ userId }) => {
    const { error } = await supabaseClient
      .from<definitions["profile"]>("profile")
      .delete()
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
