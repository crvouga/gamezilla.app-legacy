<script>
  import "../app.css";
  import Toaster from "$lib/components/Toaster.svelte";
  import { stores } from "$lib/stores";

  const { toast } = stores;
</script>

<svelte:head>
  <title>Gamezilla</title>

  <meta name="description" content="Play online games with your friend" />
</svelte:head>

<slot />

<Toaster
  on:removed={(event) => {
    stores.toast.remove([event.detail.id]);
  }}
  toasts={$toast} />
