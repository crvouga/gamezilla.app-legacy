import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import { Item, ItemCenter, ItemEnd, ItemStart } from "Components/Item";
import { PageBar, PageBarTitle } from "Components/PageBar";
import React, { useState } from "react";
import { Container } from "../Components/Container";
import * as Icons from "../Components/Icons";

export const LoginPage = () => {
  const [state, setState] = useState<"idle" | "redirecting">("idle");

  const dispatch = (message: { type: "login-with-google" }) => {
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
