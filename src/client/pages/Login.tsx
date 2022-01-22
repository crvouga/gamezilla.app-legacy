import React from "react";
import { useMutation } from "react-query";
import { Icons, Item, ModalLoader, PageBar } from "../components";
import { login } from "../data-access";

export const LoginPage = () => {
  const mutation = useMutation(login);

  if (mutation.status === "loading") {
    return <ModalLoader title="Redirecting..." />;
  }

  return (
    <>
      <PageBar center="Login" />

      <Item
        onClick={() => {
          mutation.mutate({ provider: "google" });
        }}
        start={<Icons.Google />}
        center="Continue With Google"
        end={<Icons.CheveronRight />}
      />
    </>
  );
};
