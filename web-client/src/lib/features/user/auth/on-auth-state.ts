import type { IUserId } from "$lib/features";
import { toUserId } from "$lib/features";
import { supabaseClient } from "../../_supabase";

export type IAuthState =
  | {
      status: "authenticated";
      authUser: {
        userId: IUserId;
        name?: string;
      };
    }
  | {
      status: "unauthenticated";
    };

export const onAuthState = (set: (authState: IAuthState) => void) => {
  const session = supabaseClient.auth.session();

  if (session) {
    set({
      status: "authenticated",
      authUser: {
        userId: toUserId(session.user.id),
        name: String(session.user.user_metadata?.name),
      },
    });
  }

  const { data } = supabaseClient.auth.onAuthStateChange(
    (eventType, session) => {
      switch (eventType) {
        case "PASSWORD_RECOVERY":
        case "SIGNED_IN":
        case "USER_UPDATED":
          set({
            status: "authenticated",
            authUser: {
              userId: toUserId(session.user.id),
              name: String(session.user.user_metadata?.name),
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
};
