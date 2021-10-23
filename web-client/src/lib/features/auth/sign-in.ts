import { supabaseClient } from "$lib/supabase";
import { dropLastWhile } from "$lib/utility";

export type ISignInMethod =
  | {
      type: "social";
      provider: "google";
    }
  | {
      type: "email";
      emailAddress: string;
    }
  | {
      type: "phone";
      phoneNumber: string;
    };

const removeTrailingBackslash = (url: string) => {
  return dropLastWhile((_) => _ === "/", url.split("")).join("");
};

export const signIn = async (signInMethod: ISignInMethod) => {
  const redirectTo = removeTrailingBackslash(window.location.href);

  switch (signInMethod.type) {
    case "social": {
      const { error } = await supabaseClient.auth.signIn(
        {
          provider: signInMethod.provider,
        },
        {
          redirectTo,
        }
      );

      return [error];
    }

    case "phone": {
      const { error } = await supabaseClient.auth.signIn({
        phone: signInMethod.phoneNumber,
      });

      return [error];
    }

    case "email": {
      const { error } = await supabaseClient.auth.signIn({
        email: signInMethod.emailAddress,
      });

      return [error];
    }

    default:
      return [new Error(`Authentication method unsupported`)];
  }
};
