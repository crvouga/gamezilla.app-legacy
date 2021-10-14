<script lang="ts">
  let className: string | undefined;
  export { className as class };
</script>

<div
  class="{className} p-4 text-base bg-red-200 text-red-800 rounded flex items-center font-bold">
  {#if $$slots.prefix}
    <div class="pr-4 mb-auto">
      <slot name="prefix" />
    </div>
  {/if}

  <div class="flex-1">
    <slot />
  </div>

  {#if $$slots.suffix}
    <div class="pl-4 mb-auto">
      <slot name="suffix" />
    </div>
  {/if}
</div>
