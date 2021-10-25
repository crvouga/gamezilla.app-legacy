<script lang="ts">
  import Icon from "./Icon.svelte";

  let overridesClass: string = "";
  export { overridesClass as class };

  export let src: string | undefined = undefined;
  export let alt: string | undefined = undefined;

  $: baseClass = `inline-block h-8 w-8 rounded-full ring-1 ring-gray-200 avatar ${overridesClass}`;
  $: imageClass = `${baseClass}`;
  $: iconClass = `${baseClass} bg-gray-200 text-gray-400`;
</script>

<style>
  .avatar {
    max-height: 100%;
  }
</style>

{#if src}
  <img class={imageClass} {src} {alt} />
{:else}
  <Icon class={iconClass} iconName="user" />
{/if}
