import { Elm } from "../elm/Main.elm";
import { supabaseClient } from "./supabase-client";

const app = Elm.Main.init({
  node: document.body,
  flags: {
    greeting: "Greetings from TS",
  },
});

app.ports.interopFromElm?.subscribe(async (fromElm) => {
  switch (fromElm.tag) {
    case "logOut": {
      await supabaseClient.auth.signOut();

      break;
    }

    case "logIn": {
      const redirectTo = window.location.href;

      switch (fromElm.data.method) {
        case "Google": {
          await supabaseClient.auth.signIn(
            {
              provider: "google",
            },
            {
              redirectTo,
            },
          );
          break;
        }
        case "Facebook": {
          console.error("Unsuppported sign in method");
          break;
        }
      }
      break;
    }
  }
});

setTimeout(() => {
  const session = supabaseClient.auth.session();
  const userId = session?.user?.id;

  if (userId) {
    app.ports.interopToElm.send({
      tag: "authStateChanged",
      type: "LoggedIn",
      userId,
    });
    return;
  }

  app.ports.interopToElm.send({
    tag: "authStateChanged",
    type: "LoggedOut",
  });
}, 2000);

supabaseClient.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case "PASSWORD_RECOVERY":
    case "SIGNED_IN":
    case "TOKEN_REFRESHED":
    case "USER_UPDATED":
      const userId = session?.user?.id;

      if (userId) {
        app.ports.interopToElm.send({
          tag: "authStateChanged",
          type: "LoggedIn",
          userId,
        });
      }
      break;
    case "SIGNED_OUT":
    case "USER_DELETED":
      app.ports.interopToElm.send({
        tag: "authStateChanged",
        type: "LoggedOut",
      });
      break;
  }
});
