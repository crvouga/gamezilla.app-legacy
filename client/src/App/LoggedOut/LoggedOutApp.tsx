import { ModalLoader } from "Components/ModalLoader";
import { Container } from "Components/Container";
import * as Icons from "Components/Icons";
import { Item } from "Components/Item";
import { PageBar } from "Components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "supabase/supabase-client";

export const LoggedOutApp = () => {
  const [state, setState] = useState<"idle" | "logging-in">("idle");

  const dispatch = async (message: { type: "login-with-google" }) => {
    if (message.type === "login-with-google") {
      setState("logging-in");
      await supabaseClient.auth.signIn({ provider: "google" });
    }
  };

  return (
    <>
      {state === "logging-in" && <ModalLoader title="Redirecting..." />}

      <Container>
        <PageBar title="Login" />

        <Item
          onClick={() => dispatch({ type: "login-with-google" })}
          start={<Icons.Google />}
          center="Continue With Google"
          end={<Icons.CheveronRight />}
        />
      </Container>
    </>
  );
};
