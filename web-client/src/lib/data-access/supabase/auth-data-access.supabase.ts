import { environment } from "$lib/environment";
import { dropLastWhile } from "$lib/utility";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";
import type { IAuthDataAccess } from "../auth-data-access.interface";
import { toUserId } from "../auth-data-access.interface";
import { toAvatarSeed } from "../avatars";

const removeTrailingBackslash = (url: string) => {
  return dropLastWhile((character) => character === "/", url.split("")).join(
    ""
  );
};

export const AuthDataAccessSupabase = ({
  supabaseAuthClient,
}: {
  supabaseAuthClient: SupabaseAuthClient;
}): IAuthDataAccess => {
  return {
    async unauthenticate() {
      const { error } = await supabaseAuthClient.signOut();

      return [error];
    },

    async authenticate(authMethod) {
      switch (authMethod.type) {
        case "social": {
          const redirectTo = environment.isProduction
            ? undefined
            : removeTrailingBackslash(window.location.toString());

          const { error } = await supabaseAuthClient.signIn(
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
          const { error } = await supabaseAuthClient.signIn({
            phone: authMethod.phoneNumber,
          });

          return [error];
        }

        case "email": {
          const { error } = await supabaseAuthClient.signIn({
            email: authMethod.emailAddress,
          });

          return [error];
        }

        default:
          return [new Error(`Authentication method unsupported`)];
      }
    },

    onAuthStateChanged(set) {
      const session = supabaseAuthClient.session();

      if (session) {
        set({
          status: "authenticated",
          authUser: {
            avatarSeed: toAvatarSeed(session.user.id),
            avatarStyle: "avataaars",
            userId: toUserId(session.user.id),
          },
        });
      }

      const { data } = supabaseAuthClient.onAuthStateChange(
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
