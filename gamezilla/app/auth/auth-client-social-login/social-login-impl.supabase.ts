import { createClient } from "@supabase/supabase-js";
import { SocialLogin } from "./social-login";
import { Err, NotAsked, Ok } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

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
        const userId = session?.user?.id ?? null;

        if (!UserId.is(userId)) {
          continue;
        }

        supabaseClient.auth.signOut();

        return Ok(userId);
      }

      return Err("Failed to authenticate");
    },

    async startSocialLogin({ provider }) {
      switch (provider) {
        case "google": {
          const result = await supabaseClient.auth.signIn({
            provider: "google",
          });

          sessionStorage.setItem(KEY, SocialLoginState.STARTED);

          if (result.error) {
            return Err(result.error.message);
          }

          return Ok(null);
        }
      }
    },
  };
};
