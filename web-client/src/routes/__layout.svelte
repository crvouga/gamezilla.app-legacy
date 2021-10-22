<script lang="ts">
  import Toaster from "$lib/components/Toaster.svelte";
  import AuthPage from "./auth/index.svelte";
  import { auth, toast } from "$lib/stores";
  import "../app.css";

  $: authState = $auth;
</script>

<svelte:head>
  <title>Gamezilla</title>

  <meta name="description" content="Play online games with your friend" />
</svelte:head>

{#if authState.status === 'authenticated'}
  <slot />
{:else}
  <AuthPage />
{/if}

<Toaster
  on:removed={(event) => {
    const toastId = event.detail.id;
    toast.remove([toastId]);
  }}
  toasts={$toast} />
