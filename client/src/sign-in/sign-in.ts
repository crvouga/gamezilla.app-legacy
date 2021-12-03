import { dropLastWhile } from "../utility";
import { supabaseClient } from "../lib/supabase-client";

export type ISignInMethod = {
  type: "google";
  redirectTo: string;
};

const formatRedirectTo = (redirectTo: string) => {
  return dropLastWhile(
    (character) => character === "/",
    redirectTo.split("/")
  ).join("");
};

export const signIn = async (method: ISignInMethod) => {
  if (method.type === "google") {
    const response = await supabaseClient.auth.signIn(
      {
        provider: "google",
      },
      {
        redirectTo: formatRedirectTo(method.redirectTo),
      }
    );

    return {
      errors: [
        //
        new Error(response.error.message),
      ],
    };
  }

  return {
    errors: [new Error("Unsupported sign in method")],
  };
};
