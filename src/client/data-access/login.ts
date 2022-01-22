import { supabaseClient } from "../../shared/supabase";

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
};
