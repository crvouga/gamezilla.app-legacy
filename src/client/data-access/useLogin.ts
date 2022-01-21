import { useState } from "react";
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

export const useLogin = () => {
  const [status, setStatus] = useState<"redirecting" | "idle">("idle");

  if (status === "idle") {
    return {
      status,
      async mutate({ provider }: { provider: "google" }) {
        setStatus("redirecting");
        await login({ provider });
        setStatus("idle");
      },
    };
  }

  return {
    status,
  };
};
