import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import React from "react";

import { useNavigate } from "react-router-dom";
import { authDataAccess } from "./auth-data-access";

export const SignOutPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/account");
  };

  const handleSignOut = () => {
    navigate("/");
    authDataAccess.signOut();
  };

  return (
    <Dialog open onClose={handleCancel}>
      <DialogTitle>Sign Out of Gamezilla?</DialogTitle>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </DialogActions>
    </Dialog>
  );
};
