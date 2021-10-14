<script context="module">
  export const toastStore = ToastStore();
</script>

<script>
  import "../app.css";
  import Toaster, { ToastStore } from "$lib/components/Toaster.svelte";
</script>

<svelte:head>
  <title>Gamezilla</title>
  <meta name="description" content="Play games with your friend" />
</svelte:head>

<slot />

<Toaster toasts={$toastStore} />
