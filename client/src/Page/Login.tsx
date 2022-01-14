import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import { Container } from "Components/Container";
import * as Icons from "Components/Icons";
import { Item, ItemCenter, ItemEnd, ItemStart } from "Components/Item";
import { PageBar, PageBarTitle } from "Components/PageBar";
import React, { useState } from "react";

export const LoginPage = () => {
  const [state, setState] = useState<"idle" | "redirecting">("idle");

  const transition = (message: { type: "login-with-google" }) => {
    if (message.type === "login-with-google") {
      setState("redirecting");
    }
  };

  return (
    <>
      {state === "redirecting" && (
        <BackdropLoader>
          <BackdropLoaderTitle>Redirecting...</BackdropLoaderTitle>
        </BackdropLoader>
      )}

      <Container>
        <PageBar>
          <PageBarTitle>Login</PageBarTitle>
        </PageBar>
        <Item onClick={() => transition({ type: "login-with-google" })}>
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
