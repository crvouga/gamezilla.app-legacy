import { definitions, supabaseClient } from "../../../data-access";
import { IDataAccess } from "./delete-logic";

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
