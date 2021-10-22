<script lang="ts">
  import Icon from "./Icon.svelte";

  export let src: string | undefined = undefined;
  export let alt: string | undefined = undefined;
</script>

{#if src}
  <img
    class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
    {src}
    {alt} />
{:else}
  <Icon class="h-10 w-10" iconName="user" />
{/if}
