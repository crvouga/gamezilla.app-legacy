<script lang="ts">
  export let label = "";
  export let value;

  let className = "";
  export { className as class };
</script>

<div class={className}>
  {#if label}
    <label class="block text-gray-700 text-sm font-bold mb-2"> {label} </label>
  {/if}

  <select
    bind:value
    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1">
    <slot />
  </select>
</div>
