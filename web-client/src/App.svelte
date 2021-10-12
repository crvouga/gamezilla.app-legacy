<script lang="ts" context="module">
  export const getAuthUserContext = () => {
    const authUser = getContext("authUser");
    if (authUser) {
      return authUser as IAuthUser;
    }
    throw new Error("Can only get auth user in an authenticated context");
  };

  export const toastStore = ToastStore();
</script>

<script lang="ts">
  import { getContext } from "svelte";
  import { Route, Router } from "svelte-routing";
  import type { IAuthUser } from "./data-access/auth-data-access.interface";
  import Toaster, { ToastStore } from "./generic/Toaster.svelte";
  import AuthEmailPage from "./pages/auth/email.svelte";
  import AuthPage from "./pages/auth/index.svelte";
  import AuthPhonePage from "./pages/auth/phone.svelte";
  import HomePage from "./pages/HomePage.svelte";
  import LobbyPage from "./pages/LobbyPage.svelte";
  import UnauthPage from "./pages/UnauthPage.svelte";
  import YourLobbiesPage from "./pages/YourLobbiesPage.svelte";
</script>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<Toaster toasts={$toastStore} />

<Router>
  <Route let:params path="/lobby/:lobbyId">
    <LobbyPage lobbyId={params.lobbyId} />
  </Route>

  <Route path="/auth/phone" component={AuthPhonePage} />
  <Route path="/auth/email" component={AuthEmailPage} />
  <Route path="/auth" component={AuthPage} />
  <Route path="/auth-user/lobby" component={YourLobbiesPage} />
  <Route path="/unauth" component={UnauthPage} />
  <Route path="/" component={HomePage} />
</Router>
