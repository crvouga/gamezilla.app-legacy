import { supabaseClient } from "src/supabase";
import { dropLastWhile } from "src/utility";

type IAuthState =
  | {
      type: "logged-in";
      userId: string;
    }
  | {
      type: "logged-out";
    }
  | {
      type: "loading";
    };

const subscribe = (emit: (event: IAuthState) => void): (() => void) => {
  emit({
    type: "loading",
  });

  setTimeout(() => {
    const session = supabaseClient.auth.session();
    if (session?.user?.id) {
      emit({ type: "logged-in", userId: session.user.id });
      return;
    }

    emit({ type: "logged-out" });
  }, 1000);

  const response = supabaseClient.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case "PASSWORD_RECOVERY":
      case "USER_UPDATED":
      case "TOKEN_REFRESHED":
      case "SIGNED_IN":
        if (session?.user?.id) {
          emit({
            type: "logged-in",
            userId: session.user.id,
          });
        } else {
          emit({
            type: "logged-out",
          });
        }
        return;

      case "SIGNED_OUT":
      case "USER_DELETED":
        emit({
          type: "logged-out",
        });
        return;
    }
  });
  return () => {
    response.data?.unsubscribe();
  };
};

export type ISignInMethod = {
  type: "google";
};

const formatRedirect = (redirect: string) => {
  return dropLastWhile((_) => _ === "/", redirect.split("")).join("");
};

export type ISignIn = (method: ISignInMethod) => Promise<{ errors: Error[] }>;

const signIn: ISignIn = async (method) => {
  if (method.type === "google") {
    const redirectTo = formatRedirect(window.location.href);

    const { error } = await supabaseClient.auth.signIn(
      {
        provider: "google",
      },
      {
        redirectTo,
      }
    );

    return {
      errors: error ? [new Error(error.message)] : [],
    };
  }

  return {
    errors: [new Error("Unsupported sign in method")],
  };
};

export type ISignOut = () => Promise<{ errors: Error[] }>;

const signOut: ISignOut = async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    return {
      errors: [new Error(error.message)],
    };
  }

  return {
    errors: [],
  };
};

export const authDataAccess = {
  signIn,
  signOut,
  subscribe,
};
