import * as Icons from "../../Components/Icons";
import { Item } from "../../Components/Item";
import { ModalLoader } from "../../Components/ModalLoader";
import { PageBar } from "../../Components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "../../supabase";

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
