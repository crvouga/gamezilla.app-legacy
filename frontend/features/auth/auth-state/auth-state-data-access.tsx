import { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../../../data-access";
import { IAuthState, IDataAccess } from "./auth-state";

export const sessionToAuthState = (session: Session | null): IAuthState => {
  const userId = session?.user?.id;
  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      type: "signed-in",
      userId,
      defaultName,
    };
  }

  return {
    type: "signed-out",
  };
};

export const dataAccess: IDataAccess = {
  subscribe: (emit) => {
    const timeoutHandler = setTimeout(() => {
      emit(sessionToAuthState(supabaseClient.auth.session()));
    }, 1000);

    const response = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        clearTimeout(timeoutHandler);
        emit(sessionToAuthState(session));
      }
    );

    return () => {
      response.data?.unsubscribe();
    };
  },
};
