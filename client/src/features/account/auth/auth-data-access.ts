import { supabaseClient } from "src/supabase";
import { dropLastWhile } from "src/utility";
import { auth } from "./auth";

type IEvent =
  | ReturnType<typeof auth.actions.signedIn>
  | ReturnType<typeof auth.actions.signedOut>;

const onAuthEvents = (emit: (event: IEvent) => void) => {
  const timeout = setTimeout(() => {
    const session = supabaseClient.auth.session();

    if (session) {
      emit(
        auth.actions.signedIn({
          id: String(session?.user?.id),
        }),
      );
      return;
    }

    emit(auth.actions.signedOut());
  }, 1000);

  const response = supabaseClient.auth.onAuthStateChange((event, session) => {
    clearTimeout(timeout);

    switch (event) {
      case "PASSWORD_RECOVERY":
      case "SIGNED_IN":
      case "TOKEN_REFRESHED":
      case "USER_UPDATED":
        emit(
          auth.actions.signedIn({
            id: String(session?.user?.id),
          }),
        );
        return;
      case "SIGNED_OUT":
      case "USER_DELETED":
        emit(auth.actions.signedOut());
        return;
    }
  });

  return () => {
    response?.data?.unsubscribe();
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
      },
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
  onAuthEvents,
};
