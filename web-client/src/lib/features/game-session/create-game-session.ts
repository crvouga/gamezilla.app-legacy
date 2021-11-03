import type { IUserId } from "../users";
import { supabaseClient } from "../_supabase";
import type { definitions } from "../_supabase";
import { generateUniqueId } from "$lib/utility";

export const createGameSession = async ({
  userId,
}: {
  userId: IUserId;
}): Promise<{ errors: Error[]; gameSessionId?: string }> => {
  const gameSessionId = generateUniqueId();

  const gameSessionInsert = await supabaseClient
    .from<definitions["game_sessions"]>("game_sessions")
    .insert({
      id: gameSessionId,
    });

  if (gameSessionInsert.error) {
    return {
      errors: [new Error(gameSessionInsert.error.message)],
    };
  }

  const gameSessionUserInsert = await supabaseClient
    .from<definitions["game_sessions_users"]>("game_sessions_users")
    .insert({
      game_session_id: gameSessionId,
      user_id: userId,
    });

  if (gameSessionUserInsert.error) {
    return {
      errors: [new Error(gameSessionUserInsert.error.message)],
    };
  }

  return {
    errors: [],
    gameSessionId,
  };
};
