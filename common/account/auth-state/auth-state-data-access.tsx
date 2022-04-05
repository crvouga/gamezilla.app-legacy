import { Session } from "@supabase/supabase-js";
import { eventChannel } from "redux-saga";
import { supabaseClient } from "../../infrastructure/supabase";
import { actions, IAction, IDataAccess } from "./auth-state";

export const sessionToAuthEvent = (session: Session | null): IAction => {
  const userId = session?.user?.id;
  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return actions.signedIn({
      userId,
      defaultName,
    });
  }

  return actions.signedOut();
};

export const dataAccess: IDataAccess = {
  authEventChan: eventChannel((emit) => {
    const timeoutHandler = setTimeout(() => {
      emit(sessionToAuthEvent(supabaseClient.auth.session()));
    }, 1000);

    const response = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        clearTimeout(timeoutHandler);
        emit(sessionToAuthEvent(session));
      }
    );

    return () => {
      response.data?.unsubscribe();
    };
  }),
};
