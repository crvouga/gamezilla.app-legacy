import {
  IGetElseCreateProfile,
  IOnProfile,
  ISetProfile,
} from "../core/profile/profile";
import { supabase } from "./supabase";
import { definitions } from "./types";
export const onProfile: IOnProfile =
  ({ userId }) =>
  (set) => {
    const response = supabase
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
      response.unsubscribe();
    };
  };

export const setProfile: ISetProfile = async (profile) => {
  console.log({ setProfile: profile });
};

export const getElseCreateProfile: IGetElseCreateProfile = async ({
  userId,
}) => {
  console.log({ getElseCreateProfile: userId });
  return {
    userId,
    name: "hello",
    avatarUrl: "hello",
  };
};
