import { useEffect, useState } from "react";
import { IAuthState } from "./auth-state";
import { dataAccess } from "./auth-state-data-access";

export const useAuthState = () => {
  const [state, setState] = useState<IAuthState>({ type: "loading" });

  useEffect(() => {
    return dataAccess.subscribe(setState);
  }, []);

  return state;
};
