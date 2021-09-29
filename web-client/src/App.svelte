<script lang="ts">
  import { Route, Router } from "svelte-routing";
  import AuthPage from "./pages/AuthPage.svelte";
  import UnauthPage from "./pages/UnauthPage.svelte";
  import HomePage from "./pages/HomePage.svelte";
  import LoadingPage from "./pages/LoadingPage.svelte";
  import LobbyPage from "./pages/LobbyPage.svelte";
  import { authStateStore } from "./stores";
  import "./app.css";
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
