import type { definitions } from "../../_supabase";
import { supabaseClient } from "../../_supabase";
import type { IUserId } from "../user";
import { toUserId } from "../user";
import { generateAvatarUrl } from "./avatar";
import type { IName } from "./name";
import { toName } from "./name";

export type IProfile = {
  avatarUrl?: string;
  name: IName;
  userId: IUserId;
};

export const rowToProfile = (row: definitions["user_profiles"]): IProfile => {
  return {
    userId: toUserId(row.id),
    avatarUrl: row.avatar_url,
    name: toName(row.name),
  };
};

export const createProfile = async ({
  userId,
  name,
}: {
  userId: IUserId;
  name?: string;
}) => {
  const result = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
    .insert({
      id: userId,
      name,
      avatar_url: generateAvatarUrl(name ?? userId),
    })
    .single();

  return rowToProfile(result.data);
};

export const getProfile = async ({ userId }: { userId: IUserId }) => {
  const { data } = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return rowToProfile(data);
  }

  return null;
};

export const getElseCreateProfile = async ({
  userId,
  name,
}: {
  userId: IUserId;
  name?: string;
}) => {
  const got = await getProfile({ userId });

  if (got) {
    return got;
  }

  const created = await createProfile({ userId, name });

  return created;
};

export const setProfile = async ({
  userId,
  name,
  avatarUrl,
}: {
  userId: IUserId;
  name: IName;
  avatarUrl?: string;
}) => {
  const { error } = await supabaseClient
    .from<definitions["user_profiles"]>("user_profiles")
    .update({
      name: name,
      avatar_url: avatarUrl,
    })
    .eq("id", userId);

  return {
    errors: error ? [new Error(error.message)] : [],
  };
};

export const onProfile = (
  {
    userId,
  }: {
    userId: IUserId;
  },
  set: (profile: IProfile) => void
) => {
  getProfile({ userId }).then((profile) => {
    if (profile) {
      set(profile);
    }
  });

  const subscription = supabaseClient
    .from<definitions["user_profiles"]>(`user_profiles:id=eq.${userId}`)
    .on("*", (payload) => {
      set(rowToProfile(payload.new));
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
