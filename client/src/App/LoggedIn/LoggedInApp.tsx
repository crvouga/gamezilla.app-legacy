import { Alert } from "Components/Alert";
import { Backdrop } from "Components/Backdrop";
import { ModalLoader } from "Components/ModalLoader";
import React from "react";
import { EditProfilePage } from "./EditProfile";
import { HomePage } from "./Home";
import { useProfile } from "./useProfile";
import { useRouter } from "./useRouter";

export const LoggedInApp = ({ userId }: { userId: string }) => {
  const profileState = useProfile({ userId });

  const router = useRouter();

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
      return <ModalLoader title="Loading Profile..." />;

    case "loaded":
      return (
        <>
          {router.route === "home" && <HomePage />}
          {router.route === "edit-profile" && <EditProfilePage />}
        </>
      );
  }
};
