import {
  generateRandomAvatarUrl,
  IFindElseCreateProfile,
  IFindProfile,
  ICreateProfile,
  IOnProfile,
  IUpdateProfile,
} from "@client";
import { supabase } from "./supabase";
import { definitions } from "./types";

export const onProfile: IOnProfile = ({ userId }) => (set) => {
  const subscription = supabase
    .from<definitions["profile"]>(`profile:id=eq.${userId}`)
    .on("*", (payload) => {
      set({
        userId: payload.new.id,
        avatarUrl: payload.new.avatar_url,
        name: payload.new.name,
      });
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const updateProfile: IUpdateProfile = async (profile) => {
  const { error } = await supabase
    .from<definitions["profile"]>("profile")
    .update({
      avatar_url: profile.avatarUrl,
      name: profile.name,
    })
    .match({ id: profile.userId });

  if (error) {
    return {
      error: new Error(error.message ?? error.code),
    };
  }

  return {
    error: null,
  };
};

export const findProfile: IFindProfile = async ({
  userId,
}: {
  userId: string;
}) => {
  const { data } = await supabase
    .from<definitions["profile"]>("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return {
      userId: data.id,
      name: data.name,
      avatarUrl: data.avatar_url,
    };
  }

  return null;
};

export const createProfile: ICreateProfile = async ({
  userId,
}: {
  userId: string;
}) => {
  await supabase.from<definitions["profile"]>("profile").insert({
    id: userId,
    avatar_url: generateRandomAvatarUrl(),
    name: "",
  });
};

export const findElseCreateProfile: IFindElseCreateProfile = async ({
  userId,
}) => {
  const found = await findProfile({ userId });

  if (found) {
    return found;
  }

  await createProfile({ userId });

  return findProfile({ userId });
};
