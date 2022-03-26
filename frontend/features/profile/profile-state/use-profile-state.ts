import { useEffect, useState } from "react";
import { IProfileState } from "./profile-state";
import { dataAccess } from "./profile-state-data-access";

export const useProfileState = ({ userId }: { userId: string }) => {
  const [state, setState] = useState<IProfileState>({ type: "loading" });

  useEffect(() => {
    return dataAccess.subscribe({ userId })(setState);
  }, []);

  return state;
};
