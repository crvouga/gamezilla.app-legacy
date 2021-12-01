import { IOnAuthState, ISignIn, ISignOut } from "@client";
import { dropLastWhile } from "@utility";
import { supabase } from "./supabase";

export const signOut: ISignOut = () => {
  supabase.auth.signOut();
};

const formatRedirectTo = (redirectTo: string) => {
  return dropLastWhile(
    (character) => character === "/",
    redirectTo.split("")
  ).join("");
};

export const signIn: ISignIn = async (method) => {
  const redirectTo = formatRedirectTo(window.location.origin);

  switch (method.type) {
    case "google":
      await supabase.auth.signIn({ provider: "google" }, { redirectTo });
      return;
  }
};

export const onAuthState: IOnAuthState = (set) => {
  const timeout = setTimeout(() => {
    const session = supabase.auth.session();

    if (session && session.user) {
      set({
        type: "signed-in",
        userId: session.user.id,
      });
    } else {
      set({
        type: "signed-out",
      });
    }
  }, 1000);

  const response = supabase.auth.onAuthStateChange((event, session) => {
    clearTimeout(timeout);

    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "USER_UPDATED":
        if (session && session.user) {
          set({
            type: "signed-in",
            userId: session.user.id,
          });
        }
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
    response?.data?.unsubscribe?.();
  };
};
