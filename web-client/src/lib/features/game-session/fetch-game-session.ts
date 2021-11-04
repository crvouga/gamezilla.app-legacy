import type { definitions } from "../_supabase";
import { supabaseClient } from "../_supabase";
import type { IGameSession } from "./game-session";

export const fetchGameSession = async ({
  gameSessionId,
}: {
  gameSessionId: string;
}): Promise<{ data?: IGameSession; errors: Error[] }> => {
  const gameSessionResult = await supabaseClient
    .from<definitions["game_sessions"]>("game_sessions")
    .select()
    .eq("id", gameSessionId)
    .single();

  if (gameSessionResult.error) {
    return {
      errors: [new Error(gameSessionResult.error.message)],
    };
  }

  const gameSessionUsersResult = await supabaseClient
    .from<definitions["game_sessions_users"]>("game_sessions_users")
    .select()
    .eq("game_session_id", gameSessionId);

  if (gameSessionUsersResult.error) {
    return {
      errors: [new Error(gameSessionUsersResult.error.message)],
    };
  }

  const userIds = gameSessionUsersResult.data.map((row) => row.user_id);

  const userProfilesResult = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
    .select()
    .in("id", userIds);

  if (userProfilesResult.error) {
    return {
      errors: [new Error(userProfilesResult.error.message)],
    };
  }
  const users = userProfilesResult.data.reduce<{
    [userId: string]: {
      userId: string;
      name?: string;
      avatarUrl?: string;
    };
  }>(
    (usersById, row) => ({
      ...usersById,
      [row.id]: {
        userId: row.id,
        name: row.name,
        avatarUrl: row.avatar_url,
      },
    }),
    {}
  );

  return {
    data: {
      gameSessionId,
      users,
    },
    errors: [],
  };
};
