import { definitions, supabaseClient } from "@libs/third-party-services";

export const find = async ({ gameSessionId }: { gameSessionId: string }) => {
  const { data, error } = await supabaseClient
    .from<definitions["game_session"]>("game_session")
    .select("*")
    .match({ id: gameSessionId })
    .single();

  if (data) {
    return data;
  }

  return null;
};

export const create = async ({
  gameSessionId,
  hostId,
}: {
  gameSessionId: string;
  hostId: string;
}) => {
  const { data, error } = await supabaseClient
    .from<definitions["game_session"]>("game_session")
    .insert({
      id: gameSessionId,
      host_id: hostId,
    })
    .single();

  if (data) {
    return data;
  }

  return null;
};
