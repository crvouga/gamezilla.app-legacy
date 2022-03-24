import React from "react";
import { Icons, Avatar, AppBar, Menu } from "../../ui-components";

type INavigateAction =
  | {
      type: "profile";
    }
  | {
      type: "sign-out";
    }
  | {
      type: "game";
    };

export const HomeView = ({
  profile,
  navigate,
}: {
  navigate: (route: INavigateAction) => void;
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
              navigate({ type: "profile" });
            },
          },
          {
            icon: <Icons.Logout />,
            title: "Sign Out",
            onClick: () => {
              navigate({ type: "sign-out" });
            },
          },
        ]}
      />
    </>
  );
};
