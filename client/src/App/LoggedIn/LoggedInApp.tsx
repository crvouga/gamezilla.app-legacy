import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import React from "react";
import { HomePage } from "./Home";
import { useProfile } from "./useProfile";

export const LoggedInApp = ({ userId }: { userId: string }) => {
  const profileState = useProfile({ userId });

  switch (profileState.type) {
    case "loading":
      return (
        <BackdropLoader>
          <BackdropLoaderTitle>Loading Profile...</BackdropLoaderTitle>
        </BackdropLoader>
      );

    case "loaded":
      return <HomePage />;
  }
};
