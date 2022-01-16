<script lang="ts">
  import { fade } from "svelte/transition";

  let className = "";
  export { className as class };
</script>

<style>
  .backdrop {
    background-color: rgba(0, 0, 0, 0.54);
  }
</style>

<div
  on:click
  transition:fade={{ duration: 100 }}
  class="backdrop fixed top-0 left-0 bottom-0 right-0 z-50 flex items-center justify-center {className}">
  <slot />
</div>
