<script lang="ts">
  import Icon from "./Icon.svelte";

  export let src: string | undefined = undefined;
  export let alt: string | undefined = undefined;
</script>

{#if alt}
  <img
    class="inline-block h-12 w-12 rounded-full ring-2 ring-white"
    {src}
    {alt} />
{:else}
  <Icon iconName="user" />
{/if}
