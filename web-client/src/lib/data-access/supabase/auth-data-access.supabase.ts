import { environment } from "$lib/environment";
import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";
import type { IAuthDataAccess } from "../auth-data-access.interface";
import { setAuthCookie, unsetAuthCookie } from "./session";

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
            : window.location.toString();

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
      const { data } = supabaseAuthClient.onAuthStateChange(
        (event, session) => {
          console.log({
            event,
            session,
          });
          switch (event) {
            case "PASSWORD_RECOVERY":
            case "SIGNED_IN":
            case "USER_UPDATED":
              set({
                status: "authenticated",
                authUser: {
                  userId: session.user.id,
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
