import { IOnAuthState, ISignIn, ISignOut } from "../core/auth";
import { supabase } from "./supabase";

export const signOut: ISignOut = () => {
  supabase.auth.signOut();
};

export const signIn: ISignIn = async (method) => {
  switch (method.type) {
    case "google":
      await supabase.auth.signIn({ provider: "google" });
      return;
  }
};

export const onAuthState: IOnAuthState = (set) => {
  set({
    type: "loading",
  });

  if (!supabase.auth.session()) {
    set({
      type: "signed-out",
    });
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "USER_UPDATED":
        set({
          type: "signed-in",
          user: {
            userId: session.user.id,
          },
        });
        return;

      case "SIGNED_OUT":
      case "USER_DELETED":
        set({
          type: "signed-out",
        });
        return;
    }
  });

  return () => {
    data.unsubscribe();
  };
};
