import React from "react";

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

export const view = ({
  navigate,
  profile,
}: {
  navigate: (route: IRoute) => void;
  profile: { avatarUrl?: string };
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <>todo</>
      {/* <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate({ type: "profile" });
          }}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            navigate({ type: "logout" });
          }}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

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
