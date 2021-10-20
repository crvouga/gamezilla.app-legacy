<script lang="ts">
  import { goto } from "$app/navigation";
  import Clickable from "./Clickable.svelte";

  export let to: string | undefined = undefined;

  const handleClick = () => {
    goto(to);
  };
</script>

<Clickable on:click={handleClick}>
  <slot />
</Clickable>
