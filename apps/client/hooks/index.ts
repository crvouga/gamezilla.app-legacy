import { useSelector } from "react-redux";
import { selectors } from "../core";

export const useAuthState = () => {
  return useSelector(selectors.auth.state);
};

export const useAuthProfile = () => {
  const authState = useSelector(selectors.auth.state);
  const profile = useSelector(selectors.profile.slice);

  if (authState.type === "signed-in") {
    return profile;
  }

  throw new Error("Try to use auth user when not signed in");
};
