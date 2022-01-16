import React from "react";
import { supabaseClient } from "../../supabase";
import { useUrlState } from "../../utility";
import { EditAvatarPage } from "./pages/EditAvatar";
import { EditProfilePage } from "./pages/EditProfile";
import { HomePage } from "./pages/Home";
import { LogoutPage } from "./pages/Logout";
import { SearchUsersPage } from "./pages/SearchUsers";

type State =
  | {
      route: "home";
    }
  | {
      route: "edit-profile";
    }
  | {
      route: "edit-avatar";
    }
  | {
      route: "search-users";
    }
  | {
      route: "logout";
    };

const encode = (state: State) => {
  switch (state.route) {
    case "home":
      return {
        pathname: "/",
      };

    case "edit-profile":
      return {
        pathname: "/edit-profile",
      };

    case "edit-avatar":
      return {
        pathname: "/edit-avatar",
      };

    case "search-users":
      return {
        pathname: "/search-users",
      };

    case "logout":
      return {
        pathname: "/logout",
      };
  }
};

const decode = ({ pathname }: { pathname: string }): State => {
  if (pathname === "/") {
    return {
      route: "home",
    };
  }

  if (pathname === "/edit-profile") {
    return {
      route: "edit-profile",
    };
  }

  if (pathname === "/edit-avatar") {
    return {
      route: "edit-avatar",
    };
  }

  if (pathname === "/search-users") {
    return {
      route: "search-users",
    };
  }

  if (pathname === "/logout") {
    return {
      route: "logout",
    };
  }

  return {
    route: "home",
  };
};

export const LoggedInRoutes = ({
  profile,
}: {
  profile: { userId: string; avatarUrl?: string; displayName?: string };
}) => {
  const urlState = useUrlState<State>({
    encode,
    decode,
  });

  switch (urlState.state.route) {
    case "search-users":
      return <SearchUsersPage />;

    case "home":
      return (
        <HomePage
          onEditProfile={() => {
            urlState.push({ route: "edit-profile" });
          }}
          onSearchUsers={() => {
            urlState.push({ route: "search-users" });
          }}
          onLogout={() => {
            urlState.push({ route: "logout" });
          }}
        />
      );

    case "edit-profile":
      return (
        <EditProfilePage
          onEditAvatar={() => urlState.push({ route: "edit-avatar" })}
          profile={profile}
        />
      );

    case "edit-avatar":
      return <EditAvatarPage profile={profile} />;

    case "logout":
      return (
        <LogoutPage
          onLogout={() => {
            supabaseClient.auth.signOut();
          }}
          onCancel={() => {
            urlState.back();
          }}
        />
      );
  }
};
