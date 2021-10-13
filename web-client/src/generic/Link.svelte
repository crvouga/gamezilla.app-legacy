<script lang="ts">
  import Clickable from "./Clickable.svelte";

  export let to: string;
</script>

<Clickable>
  <a href={to}>
    <slot />
  </a>
</Clickable>
