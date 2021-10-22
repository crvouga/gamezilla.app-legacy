<script lang="ts">
  import Toaster from "$lib/components/Toaster.svelte";
  import { toast } from "$lib/stores";
  import "../app.css";
</script>

<svelte:head>
  <title>Gamezilla</title>

  <meta name="description" content="Play online games with your friend" />
</svelte:head>

<slot />

<Toaster
  on:removed={(event) => {
    const toastId = event.detail.id;
    toast.remove([toastId]);
  }}
  toasts={$toast} />
