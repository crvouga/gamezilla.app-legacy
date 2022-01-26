import { supabaseClient } from "../../shared/supabase";

const NEVER_RESOLVE = new Promise((_resolve, _reject) => {});

export const login = async ({ provider }: { provider: "google" }) => {
  const redirectTo = window.location.href;

  await supabaseClient.auth.signIn(
    {
      provider,
    },
    {
      redirectTo: redirectTo,
    }
  );

  await NEVER_RESOLVE;
};
