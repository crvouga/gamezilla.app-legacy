import React from "react";
import { ModalConformation } from "../../../Components/ModalConformation";

export const LogoutPage = ({
  onCancel,
  onLogout,
}: {
  onCancel: () => void;
  onLogout: () => void;
}) => {
  return (
    <ModalConformation
      title="Do you want to log out?"
      onBackdropClick={onCancel}
      left={{
        title: "Cancel",
        onClick: onCancel,
      }}
      right={{
        title: "Logout",
        onClick: onLogout,
      }}
    />
  );
};
