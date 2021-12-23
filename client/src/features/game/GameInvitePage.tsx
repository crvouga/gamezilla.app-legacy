import { ArrowBack, Clear } from "@mui/icons-material";
import {
  AppBar,
  CircularProgress,
  IconButton,
  InputBase,
  Toolbar,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchUsers } from "../search-users";

export const GameInvitePage = () => {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const [searchText] = useState("");
  const searchUsers = useSearchUsers({ searchText });

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ alignItems: "center" }}>
          <IconButton edge="start" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <InputBase
            ref={inputRef}
            autoFocus
            sx={{ flex: 1 }}
            placeholder="Search Users"
          />
          <IconButton edge="end" onClick={handleClear}>
            <Clear />
          </IconButton>
        </Toolbar>
      </AppBar>

      {searchUsers.type === "loading" && <CircularProgress />}
    </>
  );
};
