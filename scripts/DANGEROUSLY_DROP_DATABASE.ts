import { definitions } from "../source/supabase-types";
import { supabaseClient } from "./supabase-client";

export const run = async () => {
  const { data: users, error } = await supabaseClient.auth.api.listUsers();

  if (error) {
    console.error(error);
    return;
  }

  for (const user of users) {
    await supabaseClient
      .from<definitions["profile"]>("profile")
      .delete()
      .eq("id", user.id);

    console.log("deleted user's profile: ");

    const { error } = await supabaseClient.auth.api.deleteUser(user.id);

    if (error) {
      console.error("delete user error: ", error);
      break;
    }

    console.log("deleted user: ", user);
  }
};

run();
