import type { IUserId } from "../users";
import { postgresErrorToError, supabaseClient } from "../_supabase";
import type { definitions } from "../_supabase";
import { generateUniqueId } from "$lib/utility";

export const createLobby = async ({ userId }: { userId: IUserId }) => {
  const lobbyId = generateUniqueId();

  await supabaseClient.from<definitions["lobbies"]>("lobbies").insert({
    lobby_id: lobbyId,
  });

  const { error } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .update({
      lobby_id: lobbyId,
    })
    .eq("user_id", userId);

  if (error) {
    return {
      errors: [postgresErrorToError(error)],
    };
  }

  return {
    errors: [],
  };
};
