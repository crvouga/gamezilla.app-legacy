import { Avatar, Box, Chip } from "@mui/material";
import React from "react";
import { useNavigate } from "react-location";
import { useMutation } from "react-query";
import { ModalConformation } from "../components/ModalConformation";
import { ModalLoader } from "../components/ModalLoader";
import { logout } from "../data-access";

export const LogoutPage = ({
  profile,
}: {
  profile: { username: string; avatarUrl?: string };
}) => {
  const navigate = useNavigate();

  const mutation = useMutation(logout, {
    onSuccess: () => {
      navigate({
        to: "/",
        replace: true,
      });
    },
  });

  if (mutation.status === "loading") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <ModalConformation
      title={`Log out of ${profile.username}?`}
      onBackdropClick={() => {
        window.history.back();
      }}
      left={{
        title: "Cancel",
        onClick: () => {
          window.history.back();
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
