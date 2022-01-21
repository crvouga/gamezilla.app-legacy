import { useState } from "react";
import { supabaseClient } from "../../shared/supabase";

export const logout = async () => {
  await supabaseClient.auth.signOut();
};

export const useLogout = () => {
  const [status, setStatus] = useState<"logging-out" | "idle">("idle");

  if (status === "idle") {
    return {
      status,
      async mutate() {
        setStatus("logging-out");
        await logout();
        setStatus("idle");
      },
    };
  }

  return {
    status,
  };
};
