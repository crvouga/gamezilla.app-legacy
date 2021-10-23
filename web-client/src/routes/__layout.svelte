<script lang="ts">
  import Toaster from "$lib/components/Toaster.svelte";
  import { authStateStore, removeToast, toastStore } from "$lib/features";
  import AuthPage from "./auth/index.svelte";
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  html,
  body,
  #svelte {
    overflow: hidden;
  }
</style>

<svelte:head>
  <title>Gamezilla</title>

  <meta name="description" content="Play online games with your friend" />
</svelte:head>

{#if $authStateStore.status === 'authenticated'}
  <slot />
{:else}
  <AuthPage />
{/if}

<Toaster
  on:removed={(event) => {
    const toastId = event.detail.id;
    removeToast([toastId]);
  }}
  toasts={$toastStore} />
