<script lang="ts">
  import { goto } from "$app/navigation";
  import Clickable from "./Clickable.svelte";

  let className = "";
  export { className as class };

  export let to: string | undefined = undefined;

  const handleClick = () => {
    goto(to);
  };

  $: baseClass = `${className}`;
</script>

<Clickable on:click={handleClick} class={baseClass}>
  <slot />
</Clickable>
