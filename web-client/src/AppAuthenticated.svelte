<script lang="ts">
  import { setContext } from "svelte";
  import { Route, Router } from "svelte-routing";
  import {
    authUserKey,
    IAuthUser,
  } from "./data-access/auth-data-access.interface";
  import HomePage from "./pages/HomePage.svelte";
  import LobbyPage from "./pages/LobbyPage.svelte";
  import UnauthPage from "./pages/UnauthPage.svelte";
  import YourLobbiesPage from "./pages/YourLobbiesPage.svelte";

  export let authUser: IAuthUser;

  setContext(authUserKey, authUser);
</script>

<Router>
  <Route let:params path="/lobby/:lobbyId">
    <LobbyPage lobbyId={params.lobbyId} />
  </Route>

  <Route path="/auth-user/lobby" component={YourLobbiesPage} />
  <Route path="/unauth" component={UnauthPage} />
  <Route path="/" component={HomePage} />
</Router>
