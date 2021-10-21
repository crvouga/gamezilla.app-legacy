<script lang="ts">
  import Toaster from "$lib/components/Toaster.svelte";
  import { stores } from "$lib/data-access";
  import type { IAuthState } from "$lib/data-access/auth-data-access.interface";
  import "../app.css";
  import AuthPage from "./auth/index.svelte";

  const { toast } = stores;

  let status: IAuthState["status"] = "loading";

  stores.auth.subscribe(async (authState) => {
    status = authState.status;
  });
</script>

<svelte:head>
  <title>Gamezilla</title>

  <meta name="description" content="Play online games with your friend" />
</svelte:head>

{#if status === 'loading'}
  <div class="w-screen h-screen bg-gradient-to-b from-green-400 to-green-700" />
{:else if status === 'authenticated'}
  <slot />
{:else if status === 'unauthenticated'}
  <AuthPage />
{/if}

<Toaster
  on:removed={(event) => {
    const toastId = event.detail.id;
    toast.remove([toastId]);
  }}
  toasts={$toast} />
