import * as Icons from "src/Components/Icons";
import { Item } from "src/Components/Item";
import { ModalLoader } from "src/Components/ModalLoader";
import { PageBar } from "src/Components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "src/supabase";

export const LoggedOutApp = () => {
  const [state, setState] = useState<"idle" | "logging-in">("idle");

  const dispatch = async (message: { type: "login-with-google" }) => {
    if (message.type === "login-with-google") {
      setState("logging-in");
      const redirectTo = window.location.href;
      console.log({ redirectTo });
      await supabaseClient.auth.signIn(
        {
          provider: "google",
        },
        {
          redirectTo: redirectTo,
        }
      );
    }
  };

  return (
    <>
      {state === "logging-in" && <ModalLoader title="Redirecting..." />}

      <PageBar center="Login" />

      <Item
        onClick={() => dispatch({ type: "login-with-google" })}
        start={<Icons.Google />}
        center="Continue With Google"
        end={<Icons.CheveronRight />}
      />
    </>
  );
};
