import { createClient } from "@supabase/supabase-js";
import { EmailAddress, err, NotAsked, ok } from "gamezilla/@SHARED/core";
import { SocialLogin } from "./social-login";

const KEY = "social-login-state";

const SocialLoginState = {
  STARTED: "STARTED",
};

export const createSocialLogin = (): SocialLogin => {
  const SUPABASE_URL = "https://ldxpcprlgecjvqwzuxgv.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzA0MDQ5NywiZXhwIjoxOTUyNjE2NDk3fQ.ReI8CpIFbLB9Q53Az7CDBIyrn_o1JeGhPoZXdqx8Ac4";

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  return {
    async getSocialLoginResult() {
      const state = sessionStorage.getItem(KEY);

      if (state !== SocialLoginState.STARTED) {
        return NotAsked;
      }

      sessionStorage.removeItem(KEY);

      for (let i = 0; i < 15; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const session = supabaseClient.auth.session();

        const emailAddress = session?.user?.email ?? null;

        if (!EmailAddress.is(emailAddress)) {
          continue;
        }

        supabaseClient.auth.signOut();

        return ok(emailAddress);
      }

      return err("Failed to authenticate");
    },

    async redirectSocialLogin({ provider }) {
      switch (provider) {
        case "google": {
          const result = await supabaseClient.auth.signIn({
            provider: "google",
          });

          sessionStorage.setItem(KEY, SocialLoginState.STARTED);

          if (result.error) {
            return err(result.error.message);
          }

          return ok(null);
        }
      }
    },
  };
};
