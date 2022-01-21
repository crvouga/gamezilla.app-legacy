import React from "react";
import { useNavigate } from "react-router-dom";
import { ModalConformation, ModalLoader } from "../components";
import { useLogout } from "../data-access";

export const LogoutPage = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  if (logout.status === "logging-out") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <ModalConformation
      title="Do you want to log out?"
      onBackdropClick={() => {
        navigate(-1);
      }}
      left={{
        title: "Cancel",
        onClick: () => {
          navigate(-1);
        },
      }}
      right={{
        title: "Logout",
        onClick: () => {
          logout.mutate();
        },
      }}
    />
  );
};
