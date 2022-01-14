import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import { Container } from "Components/Container";
import * as Icons from "Components/Icons";
import { Item, ItemCenter, ItemEnd, ItemStart } from "Components/Item";
import { PageBar, PageBarTitle } from "Components/PageBar";
import React, { useState } from "react";
import { supabaseClient } from "supabase-client";

export const LoginPage = () => {
  const [state, setState] = useState<"idle" | "logging-in">("idle");

  const dispatch = async (message: { type: "login-with-google" }) => {
    if (message.type === "login-with-google") {
      setState("logging-in");
      await supabaseClient.auth.signIn({ provider: "google" });
    }
  };

  return (
    <>
      {state === "logging-in" && (
        <BackdropLoader>
          <BackdropLoaderTitle>Redirecting...</BackdropLoaderTitle>
        </BackdropLoader>
      )}

      <Container>
        <PageBar>
          <PageBarTitle>Login</PageBarTitle>
        </PageBar>
        <Item onClick={() => dispatch({ type: "login-with-google" })}>
          <ItemStart>
            <Icons.Google />
          </ItemStart>
          <ItemCenter>Continue With Google</ItemCenter>
          <ItemEnd>
            <Icons.CheveronRight />
          </ItemEnd>
        </Item>
      </Container>
    </>
  );
};
