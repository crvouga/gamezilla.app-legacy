<script lang="ts" context="module">
  export const getAuthUserContext = () => {
    const authUser = getContext("authUser");
    if (authUser) {
      return authUser as IAuthUser;
    }
    throw new Error("Can only get auth user in an authenticated context");
  };
</script>

<script lang="ts">
  import { getContext, onMount, setContext } from "svelte";
  import { Route, Router } from "svelte-routing";
  import "./app.css";
  import type { IAuthUser } from "./data-access/auth-data-access.interface";
  import AuthPage from "./pages/AuthPage.svelte";
  import HomePage from "./pages/HomePage.svelte";
  import LoadingPage from "./pages/LoadingPage.svelte";
  import LobbyPage from "./pages/LobbyPage.svelte";
  import UnauthPage from "./pages/UnauthPage.svelte";
  import AppAuthenticated from "./AppAuthenticated.svelte";
  import { authStateStore } from "./stores";

  $: authState = $authStateStore;
</script>

{#if authState.status === 'loading'}
  <LoadingPage />
{:else if authState.status === 'unauthenticated'}
  <AuthPage />
{:else if authState.status === 'authenticated'}
  <AppAuthenticated authUser={authState.authUser} />
{/if}
