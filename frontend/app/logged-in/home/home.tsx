import React from "react";
import * as UI from "../../../ui-components";

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
              push({ type: "logout" });
            },
          },
          {
            icon: <UI.Icons.Logout />,
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
