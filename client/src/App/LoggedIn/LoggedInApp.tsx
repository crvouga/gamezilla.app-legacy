import { Alert } from "Components/Alert";
import { Backdrop } from "Components/Backdrop";
import { ModalLoader } from "Components/ModalLoader";
import React from "react";
import { HomePage } from "./Home";
import { useProfile } from "./useProfile";

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
      return <ModalLoader title="Loading Profile..." />;

    case "loaded":
      return <HomePage />;
  }
};
