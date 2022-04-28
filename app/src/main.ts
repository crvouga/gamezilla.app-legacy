import { Session } from "@supabase/supabase-js";
import { Elm } from "./Main.elm";
import { supabaseClient } from "./supabase-client";

const app = Elm.Main.init({
  node: document.body,
  flags: null,
});

app.ports.interopFromElm.subscribe((fromElm) => {
  switch (fromElm.tag) {
    case "Alert":
      alert(
        `alerting from typescript: \n message from elm: ${fromElm.data.message}`
      );
      break;

    case "SignIn":
      supabaseClient.auth.signIn(
        {
          provider: "google",
        },
        {
          redirectTo: window.location.origin,
        }
      );
      break;

    case "SignOut":
      supabaseClient.auth.signOut();
  }
});

export const sessionToUser = (
  session: Session
): { userId: string; defaultName: string } | null => {
  const userId = session?.user?.id;

  const defaultName =
    session?.user?.user_metadata?.name ??
    session?.user?.user_metadata?.full_name ??
    "";

  if (userId) {
    return {
      userId,
      defaultName,
    };
  }

  return null;
};

const timeoutHandler = setTimeout(() => {
  const session = supabaseClient.auth.session();

  if (session) {
    const user = sessionToUser(session);

    if (user) {
      app.ports.interopToElm.send({
        tag: "SignedIn",
        userId: user.userId,
      });
      return;
    }
  }
  app.ports.interopToElm.send({
    tag: "SignedOut",
  });
}, 1000);

supabaseClient.auth.onAuthStateChange((_event, session) => {
  clearTimeout(timeoutHandler);

  if (session) {
    const user = sessionToUser(session);

    if (user) {
      app.ports.interopToElm.send({
        tag: "SignedIn",
        userId: user.userId,
      });
      return;
    }
  }

  app.ports.interopToElm.send({
    tag: "SignedOut",
  });
});
