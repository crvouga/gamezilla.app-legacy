import React from "react";
import { useNavigate } from "react-location";
import { useMutation } from "react-query";
import { ModalConformation, ModalLoader } from "../components";
import { logout } from "../data-access";

export const LogoutPage = ({ username }: { username: string }) => {
  const navigate = useNavigate();
  const mutation = useMutation(logout);

  if (mutation.status === "loading") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <ModalConformation
      title={`Log out of ${username}?`}
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
