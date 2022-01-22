import React from "react";
import { useNavigate } from "react-location";
import { useMutation } from "react-query";
import { ModalConformation, ModalLoader } from "../components";
import { logout } from "../data-access";

export const LogoutPage = () => {
  const navigate = useNavigate();
  const mutation = useMutation(logout);

  if (mutation.status === "loading") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <ModalConformation
      title="Do you want to log out?"
      onBackdropClick={() => {
        navigate({ to: "/", replace: true });
      }}
      left={{
        title: "Cancel",
        onClick: () => {
          navigate({ to: "/", replace: true });
        },
      }}
      right={{
        title: "Logout",
        onClick: () => {
          mutation.mutate();
        },
      }}
    />
  );
};
