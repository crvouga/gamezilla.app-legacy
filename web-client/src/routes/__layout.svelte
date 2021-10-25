<script lang="ts">
  import Toaster from "$lib/components/toaster/Toaster.svelte";
  import { authStateStore, dequeueToast, toasterStore } from "$lib/shared";
  import "../app.css";
  import AuthPage from "./auth/index.svelte";
</script>

{#if $authStateStore.status === 'authenticated'}
  <slot />
{:else}
  <AuthPage />
{/if}

<Toaster
  on:removed={(event) => {
    const toastId = event.detail.id;
    dequeueToast([toastId]);
  }}
  toasts={$toasterStore} />
