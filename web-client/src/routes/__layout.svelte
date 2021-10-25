<script lang="ts">
  import Toaster from "./_Toaster.svelte";
  import { authStateStore, removeToast, toastStore } from "$lib/features";
  import AuthPage from "./auth/index.svelte";
  import "../app.css";
</script>

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
