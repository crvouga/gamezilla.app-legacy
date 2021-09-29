<script lang="ts">
  import { setContext } from "svelte";
  import { Route, Router } from "svelte-routing";
  import "./app.css";
  import {
    authUserKey,
    IAuthUser,
  } from "./data-access/auth-data-access.interface";
  import HomePage from "./pages/HomePage.svelte";
  import LobbyPage from "./pages/LobbyPage.svelte";
  import UnauthPage from "./pages/UnauthPage.svelte";

  export let authUser: IAuthUser;

  setContext(authUserKey, authUser);
</script>

<Router>
  <Route path="/lobby" component={LobbyPage} />
  <Route path="/unauth" component={UnauthPage} />
  <Route path="/" component={HomePage} />
</Router>
