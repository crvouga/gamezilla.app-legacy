import { readable } from "svelte/store";
import { supabaseClient } from "./supabase-client";

type IAuthState =
  | {
      type: "signed-out";
    }
  | {
      type: "signed-in";
      userId: string;
    };

const initialState = {
  type: "signed-out",
};

export const authStore = readable<IAuthState>(initialState, (set) => {
  supabaseClient.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "USER_UPDATED":
      case "TOKEN_REFRESHED":
        set({
          type: "signed-in",
          userId: session.user.id,
        });
        break;

      case "SIGNED_OUT":
      case "USER_DELETED":
        set({
          type: "signed-out",
        });
        break;
    }
  });
});
