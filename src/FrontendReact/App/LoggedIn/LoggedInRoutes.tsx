import React from "react";
import { supabaseClient } from "../../supabase";
import { useLocationState } from "../../utility";
import { EditAvatarPage } from "./pages/EditAvatar";
import { EditProfilePage } from "./pages/EditProfile";
import { HomePage } from "./pages/Home";
import { LogoutPage } from "./pages/Logout";
import { SearchUsersPage } from "./pages/SearchUsers";
import { TicTacToePage } from "./pages/TicTacToe";
import Routes from "./Routes";

export const LoggedInRoutes = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
    displayName?: string;
  };
}) => {
  const routeState = useLocationState(Routes);

  switch (routeState.state.type) {
    case "search-users":
      return <SearchUsersPage />;

    case "home":
      return (
        <HomePage
          onTicTacToe={() => {
            routeState.push({ type: "tic-tac-toe" });
          }}
          onEditProfile={() => {
            routeState.push({ type: "edit-profile" });
          }}
          onLogout={() => {
            routeState.push({ type: "logout" });
          }}
        />
      );

    case "edit-profile":
      return (
        <EditProfilePage
          onEditAvatar={() => {
            routeState.push({ type: "edit-avatar" });
          }}
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
            routeState.pop();
          }}
        />
      );

    case "tic-tac-toe":
      return <TicTacToePage />;
  }
};
