import { Err, Ok, PhoneNumber } from "gamezilla/@SHARED/core";
import { AuthService } from "./auth-service";
import { createClient } from "@supabase/supabase-js";
import { UserId } from "gamezilla/app/@SHARED/data";

const SUPABASE_URL = "https://ldxpcprlgecjvqwzuxgv.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzA0MDQ5NywiZXhwIjoxOTUyNjE2NDk3fQ.ReI8CpIFbLB9Q53Az7CDBIyrn_o1JeGhPoZXdqx8Ac4";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const createAuthService = (): AuthService => {
  return {
    getCurrentUser: async () => {
      const supabaseSession = supabaseClient.auth.session();

      if (!supabaseSession) {
        return Ok(null);
      }

      const parsed = UserId.decode(supabaseSession?.user?.id);

      if (parsed.t === "err") {
        return parsed;
      }

      return Ok({ userId: parsed.value });
    },
    loginWithProvider: async ({ provider }) => {
      switch (provider) {
        case "google": {
          const response = await supabaseClient.auth.signIn({
            provider: "google",
          });

          if (response.error) {
            return Err(response.error.message);
          }

          return Ok(null);
        }
      }
    },
    logout: async () => {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        return Err(error.message);
      }

      return Ok(null);
    },
    sendCode: async ({ phoneNumber }) => {
      const response = await supabaseClient.auth.signIn({
        phone: PhoneNumber.toString(phoneNumber),
      });

      if (response.error) {
        return Err(response.error.message);
      }

      return Ok(null);
    },
    verifyCode: async ({ code, phoneNumber }) => {
      const response = await supabaseClient.auth.verifyOTP({
        phone: PhoneNumber.toString(phoneNumber),
        token: code,
      });

      if (response.error) {
        return Err(response.error.message);
      }

      return Ok(null);
    },
    sendEmailLink: async ({ emailAddress }) => {
      const response = await supabaseClient.auth.signIn({
        email: emailAddress,
      });

      if (response.error) {
        return Err(response.error.message);
      }

      return Ok(null);
    },
  };
};
