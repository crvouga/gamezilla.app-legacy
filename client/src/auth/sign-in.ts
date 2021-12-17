import { dropLastWhile } from "../utility";
import { supabaseClient } from "../supabase/supabase-client";

export type ISignInMethod = {
  type: "google";
};

const formatRedirect = (redirect: string) => {
  return dropLastWhile((_) => _ === "/", redirect.split("")).join("");
};

export type ISignIn = (method: ISignInMethod) => Promise<{ errors: Error[] }>;

export const signIn: ISignIn = async (method) => {
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
