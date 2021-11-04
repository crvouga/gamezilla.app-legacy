import { supabaseClient } from "../_supabase";
import type { definitions } from "../_supabase";
import type { IGameSession } from "./game-session";
import { fetchGameSession } from "./fetch-game-session";

export const onGameSession = (
  { gameSessionId }: { gameSessionId: string },
  set: (gameSession: IGameSession) => void
): (() => void) => {
  fetchGameSession({ gameSessionId }).then((result) => {
    if (result.data) {
      set(result.data);
    }
  });

  const subscription = supabaseClient
    .from<definitions["game_sessions"]>(`game_sessions:id=eq.${gameSessionId}`)
    .on("*", (payload) => {
      const gameSessionId = payload.new.id;

      fetchGameSession({ gameSessionId }).then((result) => {
        if (result.data) {
          set(result.data);
        }
      });
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
