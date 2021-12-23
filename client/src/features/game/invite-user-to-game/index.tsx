import { ArrowBack, Clear } from "@mui/icons-material";
import {
  AppBar,
  CircularProgress,
  IconButton,
  InputBase,
  Toolbar,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { definitions, supabaseClient } from "src/supabase";

type IUser = {
  id: string;
  avatarUrl?: string;
  displayName?: string;
};

const searchUsers = async ({
  searchText,
}: {
  searchText: string;
}): Promise<IUser[]> => {
  const { data } = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .textSearch("display_name", searchText);

  return (
    data?.map((result) => ({
      id: result.id,
      avatarUrl: result.avatar_url,
      displayName: result.display_name,
    })) ?? []
  );
};

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
  const query = useQuery(["search", "users", searchText], () =>
    searchUsers({ searchText })
  );

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

      {query.status === "loading" && <CircularProgress />}
    </>
  );
};
