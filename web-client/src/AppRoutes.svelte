<script lang="ts">
  import { getContext } from "svelte";
  import { Route, Router } from "svelte-routing";
  import AuthPage from "./auth/AuthPage.svelte";
  import UnauthPage from "./auth/UnauthPage.svelte";
  import HomePage from "./HomePage.svelte";
  import LoadingPage from "./LoadingPage.svelte";
  import LobbyPage from "./LobbyPage.svelte";

  const { authStateStore } = getContext("auth");
</script>

{#if $authStateStore.status === 'loading'}
  <LoadingPage />
{:else if $authStateStore.status === 'unauthenticated'}
  <AuthPage />
{:else if $authStateStore.status === 'authenticated'}
  <Router>
    <Route path="/lobby" component={LobbyPage} />
    <Route path="/unauth" component={UnauthPage} />
    <Route path="/" component={HomePage} />
  </Router>
{/if}
