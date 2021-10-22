import type { definitions } from "$lib/generated-types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IProfileDataAccess } from "../core";
import { toAvatarSeed, toAvatarStyle, toUserId } from "../core";

export const ProfileDataAccess = ({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient;
}): IProfileDataAccess => {
  return {
    async update({ userId, avatarSeed, avatarStyle }) {
      const response = await supabaseClient
        .from<definitions["profiles"]>(
          "profiles",
        )
        .update({
          avatar_seed: avatarSeed,
          avatar_style: avatarStyle,
        })
        .eq("user_id", userId);

      return {
        errors: response.error ? [new Error(response.error.message)] : [],
      };
    },

    onProfile({ userId }, set) {
      supabaseClient
        .from<definitions["profiles"]>(
          `profiles`,
        )
        .select("*")
        .eq("user_id", userId)
        .then((response) => {
          const [found] = response.data;

          if (found) {
            set({
              avatarSeed: toAvatarSeed(found.avatar_seed),
              avatarStyle: toAvatarStyle(found.avatar_style),
              userId: toUserId(found.user_id),
            });
            return;
          }
        });

      const supscription = supabaseClient
        .from<definitions["profiles"]>(
          `profiles:user_id=eq.${userId}`,
        )
        .on("*", (payload) => {
          console.log("update", payload);
          set({
            avatarSeed: toAvatarSeed(payload.new.avatar_seed),
            avatarStyle: toAvatarStyle(payload.new.avatar_style),
            userId: toUserId(payload.new.user_id),
          });
        })
        .subscribe();

      return () => {
        supabaseClient.removeSubscription(supscription);
      };
    },
  };
};
