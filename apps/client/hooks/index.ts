import { useSelector } from "react-redux";
import { selectors } from "../core";

export const useAuthState = () => {
  return useSelector(selectors.auth.state);
};

export const useAuthUser = () => {
  const authState = useAuthState();

  if (authState.type === "signed-in") {
    return authState.user;
  }

  throw new Error("Try to use auth user when not signed in");
};
