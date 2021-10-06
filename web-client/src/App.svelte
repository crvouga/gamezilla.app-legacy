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
  import { getContext } from "svelte";
  import AppAuthenticated from "./AppAuthenticated.svelte";
  import type { IAuthUser } from "./data-access/auth-data-access.interface";
  import AuthPage from "./pages/AuthPage.svelte";
  import LoadingPage from "./shared/LoadingPage.svelte";
  import { authStateStore } from "./stores";

  $: authState = $authStateStore;
</script>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

{#if authState.status === 'loading'}
  <LoadingPage />
{:else if authState.status === 'unauthenticated'}
  <AuthPage />
{:else if authState.status === 'authenticated'}
  <AppAuthenticated authUser={authState.authUser} />
{/if}
