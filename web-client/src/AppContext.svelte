<script lang="ts">
  import { browser, dev } from "$app/env";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import {
    AuthDataAccess,
    AuthDataAccessNoop,
    IAuthState,
  } from "./auth/auth-data-access";
  import { FirebaseApp } from "./firebase-app";

  const authStateStore = writable<IAuthState>({
    status: "loading",
  });

  setContext("auth", {
    authStateStore,
    authDataAccess: AuthDataAccessNoop(),
  });

  if (browser) {
    const firebaseApp = FirebaseApp();

    const authDataAccess = AuthDataAccess({
      firebaseApp,
      emulate: dev,
    });

    authDataAccess.onAuthStateChanged(authStateStore.set);

    setContext("auth", {
      authStateStore,
      authDataAccess,
    });
  }
</script>

<slot />
