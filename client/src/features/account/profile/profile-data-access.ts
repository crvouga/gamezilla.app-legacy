import { definitions, supabaseClient } from "src/supabase";
import { generateRandomAvatarUrl } from "./avatar";

export type IProfile = {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
};

const fetch = async ({
  userId,
}: {
  userId: string;
}): Promise<IProfile | null> => {
  const response = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (response.data) {
    return {
      userId: response.data.id,
      avatarUrl: response.data.avatar_url,
      displayName: response.data.display_name,
    };
  }

  return null;
};

const create = async ({ userId }: { userId: string }) => {
  await supabaseClient.from<definitions["profiles"]>("profiles").insert({
    id: userId,
    avatar_url: generateRandomAvatarUrl(),
  });
};

const fetchElseCreate = async ({ userId }: { userId: string }) => {
  const fetched = await fetch({ userId });

  if (fetched) {
    return fetched;
  }

  await create({ userId });

  return fetch({ userId });
};

const subscribe = ({ userId }: { userId: string }) => (
  set: (profile: IProfile) => void
): (() => void) => {
  const response = supabaseClient
    .from<definitions["profiles"]>(`profiles:id=eq.${userId}`)
    .on("*", (payload) => {
      set({
        userId: payload.new.id,
        avatarUrl: payload.new.avatar_url,
        displayName: payload.new.display_name,
      });
    })
    .subscribe();

  return () => {
    response.unsubscribe();
  };
};

const update = async ({
  userId,
  displayName,
  avatarUrl,
}: {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}) => {
  await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .update({
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .match({ id: userId });
};

export const profileDataAccess = {
  fetchElseCreate,
  fetch,
  create,
  subscribe,
  update,
};
