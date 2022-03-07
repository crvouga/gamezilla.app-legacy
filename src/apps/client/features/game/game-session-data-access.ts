import { supabaseClient, colyseusClient } from "@apps/client/data-access";
import { RoomNames } from "@libs/server-interface";
import { definitions } from "@libs/supabase";

export const _create = async () => {
  // console.log({ colyseusClient, create: colyseusClient.create, RoomNames });
  await colyseusClient.create(RoomNames.GameSession);
  console.log("DONE");
};

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
