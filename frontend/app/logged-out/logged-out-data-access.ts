import { supabaseClient } from "../../data-access";
import { IDataAccess, ILogin } from "./logged-out";

export const login: ILogin = ({ type }) => {
  const redirectTo = window.location.href;

  if (type === "google") {
    supabaseClient.auth.signIn({ provider: "google" }, { redirectTo });
  }
};

export const LoggedOutDataAccess: IDataAccess = {
  login,
};
