import { environment } from "$lib/environment";
import type { definitions } from "$lib/generated-types/supabase";
import { dropLastWhile } from "$lib/utility";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IAuthDataAccess } from "../auth-data-access.interface";
import { toUserId } from "../auth-data-access.interface";
import { toAvatarSeed, toAvatarStyle } from "../profile.interface";

const removeTrailingBackslash = (url: string) => {
  return dropLastWhile((character) => character === "/", url.split("")).join(
    ""
  );
};

export const AuthDataAccessSupabase = ({
  supabaseClient,
}: {
  supabaseClient: SupabaseClient;
}): IAuthDataAccess => {
  return {
    async unauthenticate() {
      const { error } = await supabaseClient.auth.signOut();

      return [error];
    },

    async authenticate(authMethod) {
      switch (authMethod.type) {
        case "social": {
          const redirectTo = environment.isProduction
            ? undefined
            : removeTrailingBackslash(window.location.toString());

          const { error } = await supabaseClient.auth.signIn(
            {
              provider: authMethod.provider,
            },
            {
              redirectTo,
            }
          );

          return [error];
        }

        case "phone": {
          const { error } = await supabaseClient.auth.signIn({
            phone: authMethod.phoneNumber,
          });

          return [error];
        }

        case "email": {
          const { error } = await supabaseClient.auth.signIn({
            email: authMethod.emailAddress,
          });

          return [error];
        }

        default:
          return [new Error(`Authentication method unsupported`)];
      }
    },

    onAuthStateChanged(set) {
      const session = supabaseClient.auth.session();

      if (session) {
        supabaseClient
          .from<definitions["profiles"]>("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .then((response) => {
            if (response.data.length === 0) {
              return supabaseClient
                .from<definitions["profiles"]>("profiles")
                .insert({
                  user_id: session.user.id,
                  avatar_seed: session.user.id,
                  avatar_style: "avataaars",
                });
            }
            return response;
          })
          .then((response) => {
            set({
              status: "authenticated",
              authUser: {
                avatarSeed: toAvatarSeed(response.data[0].avatar_seed),
                avatarStyle: toAvatarStyle(response.data[0].avatar_style),
                userId: toUserId(session.user.id),
              },
            });
          });
      }

      const { data } = supabaseClient.auth.onAuthStateChange(
        (eventType, session) => {
          console.log({
            eventType,
            session,
          });

          switch (eventType) {
            case "PASSWORD_RECOVERY":
            case "SIGNED_IN":
            case "USER_UPDATED":
              set({
                status: "authenticated",
                authUser: {
                  avatarSeed: toAvatarSeed(session.user.id),
                  avatarStyle: "avataaars",
                  userId: toUserId(session.user.id),
                },
              });
              return;

            case "SIGNED_OUT":
            case "USER_DELETED":
              set({
                status: "unauthenticated",
              });
              return;
          }
        }
      );

      return () => {
        data.unsubscribe();
      };
    },
  };
};
