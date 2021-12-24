import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Toolbar,
} from "@mui/material";
import React, { useState } from "react";
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
  const response = await supabaseClient
    .from<definitions["profiles"]>("profiles")
    .select("*")
    .ilike("display_name", `%${searchText}%`);

  return (
    response.data?.map((result) => ({
      id: result.id,
      avatarUrl: result.avatar_url,
      displayName: result.display_name,
    })) ?? []
  );
};

export const GameInvitePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const [searchText, setSearchText] = useState("");

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
            autoFocus
            sx={{ flex: 1 }}
            placeholder="Search Users"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </Toolbar>
      </AppBar>

      <List>
        {query.status === "loading" && (
          <>
            {[1, 2, 3, 4, 5].map((n) => (
              <ListItem button divider key={n}>
                <ListItemAvatar>
                  <Skeleton variant="circular">
                    <Avatar />
                  </Skeleton>
                </ListItemAvatar>
                <ListItemText
                  primary={<Skeleton variant="rectangular" width="8em" />}
                />
              </ListItem>
            ))}
          </>
        )}
        {query.status === "success" && (
          <>
            {query.data.map((result) => (
              <ListItem button divider key={result.id}>
                <ListItemAvatar>
                  <Avatar src={result.avatarUrl} />
                </ListItemAvatar>
                <ListItemText primary={result.displayName} />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </>
  );
};
