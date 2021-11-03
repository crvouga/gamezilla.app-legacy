import { supabaseClient } from "../_supabase";
import type { definitions } from "../_supabase";

export type IGameSession = {
  gameSessionId: string;
  users: {
    [userId: string]: {
      userId: string;
      avatarUrl: string;
    };
  };
};

const getGameSession = async ({
  gameSessionId,
}: {
  gameSessionId: string;
}): Promise<IGameSession | null> => {
  const result = await supabaseClient
    .from<definitions["game_sessions"]>("game_sessions")
    .select()
    .eq("id", gameSessionId);

  return {
    gameSessionId: result.data[0].id,
    users: {},
  };
};

export const onGameSession = (
  { gameSessionId }: { gameSessionId: string },
  set: (gameSession: IGameSession) => void
): (() => void) => {
  getGameSession({ gameSessionId }).then((gameSession) => {
    set(gameSession);
  });

  const subscription = supabaseClient
    .from<definitions["game_sessions"]>(`game_sessions:id=eq.${gameSessionId}`)
    .on("*", (payload) => {
      const gameSessionId = payload.new.id;

      set({
        gameSessionId,
        users: {},
      });
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
