<script lang="ts">
  import Icon from "./Icon.svelte";

  let className: string = "";
  export { className as class };

  export let src: string | undefined = undefined;
  export let alt: string | undefined = undefined;
</script>

{#if src}
  <img
    class="inline-block h-8 w-8 rounded-full ring-2 ring-white {className}"
    {src}
    {alt} />
{:else}
  <Icon class="h-12 w-12 {className}" iconName="user" />
{/if}
