import type { SupabaseAuthClient } from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";
import type {
  IAuthDataAccess,
  IAuthState,
} from "../auth-data-access.interface";
import { environment } from "$lib/environment";

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
          const { error } = await supabaseAuthClient.signIn({
            provider: authMethod.provider,
          }, {
            redirectTo: environment.isProduction
              ? undefined
              : window.location.toString(),
          });

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

      const initialAuthState: IAuthState = session
        ? {
          status: "authenticated",
          authUser: {
            userId: session.user.id,
          },
        }
        : {
          status: "unauthenticated",
        };

      set(initialAuthState);

      const { data } = supabaseAuthClient.onAuthStateChange(
        (event, session) => {
          console.log({ event, session });
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
        },
      );

      return () => {
        data.unsubscribe();
      };
    },
  };
};
