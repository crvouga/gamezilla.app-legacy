import { Session } from "@supabase/supabase-js";
import { eventChannel } from "redux-saga";
import { supabaseClient } from "../../data-access";
import { IAuthState, IDataAccess } from "./auth-logic";

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

const getAuthState = () => {
  return sessionToAuthState(supabaseClient.auth.session());
};

export const dataAccess: IDataAccess = {
  getAuthState,

  authStateChan: eventChannel<IAuthState>((emit) => {
    const timeoutHandler = setTimeout(() => {
      emit(getAuthState());
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
  }),
};
