import type { IUserId } from "../user";
import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";

export const createGameSession = async ({
  userId,
}: {
  userId: IUserId;
}): Promise<{ errors: Error[]; gameSessionId?: string }> => {
  const gameSessionInsert = await supabaseClient
    .from<definitions["game_sessions"]>("game_sessions")
    .insert({});

  if (gameSessionInsert.error) {
    return {
      errors: [new Error(gameSessionInsert.error.message)],
    };
  }

  const gameSessionId = gameSessionInsert.data[0].id;

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
