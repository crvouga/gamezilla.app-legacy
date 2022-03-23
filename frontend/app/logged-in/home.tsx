import React from "react";
import { Icons, Avatar, AppBar, Menu } from "../../ui-components";

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

export const Home = ({
  profile,
  push,
}: {
  push: (route: IRoute) => void;
  profile: { avatarUrl?: string };
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        title={"Home"}
        end={[
          <Avatar
            src={profile.avatarUrl}
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
          />,
        ]}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        items={[
          {
            icon: <Icons.Person />,
            title: "Your profile",
            onClick: () => {
              push({ type: "profile" });
            },
          },
          {
            icon: <Icons.Logout />,
            title: "Logout",
            onClick: () => {
              push({ type: "logout" });
            },
          },
        ]}
      />
    </>
  );
};
