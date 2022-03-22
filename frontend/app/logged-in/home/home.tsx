import React from "react";
import * as UI from "../../../ui-components";
import { Action } from "../../../utils";

type IRoute =
  | {
      type: "profile";
    }
  | {
      type: "logout";
    }
  | {
      type: "game";
    };

export const actions = {
  navigate: Action("home", "navigate"),
};

export const view = ({ profile }: { profile: { avatarUrl?: string } }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <UI.AppBar
        title={"Home"}
        end={[
          <UI.Avatar
            src={profile.avatarUrl}
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
          />,
        ]}
      />

      <UI.Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        items={[
          {
            icon: <UI.Icons.Person />,
            title: "Your profile",
            onClick: () => {
              // navigate({ type: "logout" });
            },
          },
          {
            icon: <UI.Icons.Logout />,
            title: "Logout",
            onClick: () => {
              // navigate({ type: "logout" });
            },
          },
        ]}
      />

      {/* 

      <AppBar>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Home
          </Typography>

          <Avatar
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
            src={profile.avatarUrl}
          />
        </Toolbar>
      </AppBar>

      <List>
        <ListItemButton
          onClick={() => {
            navigate({ type: "game" });
          }}
        >
          <ListItemIcon>
            <Games />
          </ListItemIcon>
          <ListItemText primary="Play Game" />
          <ListItemSecondaryAction>
            <ChevronRight />
          </ListItemSecondaryAction>
        </ListItemButton>
      </List> */}
    </>
  );
};
