import React from "react";
import { ModalConformation } from "../components/ModalConformation";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../shared/supabase";
import { ModalLoader } from "../components/ModalLoader";

export const LogoutPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <ModalLoader title="Logging out..." />

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
            supabaseClient.auth.signOut();
          },
        }}
      />
    </>
  );
};
