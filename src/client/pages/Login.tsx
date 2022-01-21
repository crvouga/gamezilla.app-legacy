import * as Icons from "../components/Icons";
import { Item } from "../components/Item";
import { ModalLoader } from "../components/ModalLoader";
import { PageBar } from "../components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "../../shared/supabase";

export const LoginPage = () => {
  const [state, setState] = useState<"idle" | "logging-in">("idle");

  const loginWithGoogle = async () => {
    setState("logging-in");

    const redirectTo = window.location.href;

    await supabaseClient.auth.signIn(
      {
        provider: "google",
      },
      {
        redirectTo: redirectTo,
      }
    );
  };

  return (
    <>
      {state === "logging-in" && <ModalLoader title="Redirecting..." />}

      <PageBar center="Login" />

      <Item
        onClick={loginWithGoogle}
        start={<Icons.Google />}
        center="Continue With Google"
        end={<Icons.CheveronRight />}
      />
    </>
  );
};
