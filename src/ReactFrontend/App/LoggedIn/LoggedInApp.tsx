import { Alert } from "../../Components/Alert";
import { Backdrop } from "../../Components/Backdrop";
import { ModalLoader } from "../../Components/ModalLoader";
import React from "react";
import { EditAvatarPage } from "./EditAvatar";
import { EditProfilePage } from "./EditProfile";
import { HomePage } from "./Home";
import { SearchUsersPage } from "./SearchUsers";
import { useProfile } from "./useProfile";
import { useRouter } from "./useRouter";

const LoggedInRoutes = ({
  profile,
}: {
  profile: { userId: string; avatarUrl?: string; displayName?: string };
}) => {
  const router = useRouter();

  switch (router.route) {
    case "search-users":
      return <SearchUsersPage />;

    case "home":
      return <HomePage />;

    case "edit-profile":
      return <EditProfilePage profile={profile} />;

    case "edit-avatar":
      return <EditAvatarPage profile={profile} />;
  }
};

export const LoggedInApp = ({ userId }: { userId: string }) => {
  const profileState = useProfile({ userId });

  switch (profileState.type) {
    case "error":
      return (
        <Backdrop>
          <Alert
            className="m-4"
            variant="error"
            title="Error"
            body="Something went wrong when trying to load your profile"
          />
        </Backdrop>
      );

    case "loading":
      return <ModalLoader title="Loading..." />;

    case "loaded":
      const { profile } = profileState;
      return <LoggedInRoutes profile={profile} />;
  }
};
