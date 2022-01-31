import { Avatar, Box, Chip } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/", { replace: true });
    },
  });

  if (mutation.status === "loading") {
    return <ModalLoader title="Logging out..." />;
  }

  return (
    <ModalConformation
      title={`Log out of ${profile.username}?`}
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
          mutation.mutate();
        },
      }}
    />
  );
};
