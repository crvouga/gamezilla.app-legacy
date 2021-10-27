<script lang="ts">
  import "./page-header.css";
  import Button from "$lib/components/Button.svelte";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  const dispatch = createEventDispatcher();

  export let title = "Unsaved changes";
</script>

<div
  transition:slide
  class="w-full h-12 p-4 text-base bg-black text-white flex items-center">
  <div class="flex-1 title">{title}</div>
  <Button class="mr-2" on:click={() => dispatch('cancel')}>Cancel</Button>
  <Button on:click={() => dispatch('save')}>Save</Button>
</div>
