import React from "react";
import { Icons, Item, ModalLoader, PageBar } from "../components";
import { useLogin } from "../data-access";

export const LoginPage = () => {
  const login = useLogin();

  if (login.status === "redirecting") {
    return <ModalLoader title="Redirecting..." />;
  }

  return (
    <>
      <PageBar center="Login" />

      <Item
        onClick={() => {
          login.mutate({ provider: "google" });
        }}
        start={<Icons.Google />}
        center="Continue With Google"
        end={<Icons.CheveronRight />}
      />
    </>
  );
};
