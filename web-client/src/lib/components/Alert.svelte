<script lang="ts">
  let className: string | undefined;

  export { className as class };
  export let variant: "error" | "success" = "success";

  const errorClass = `bg-red-200 text-red-800`;
  const successClass = `bg-green-200 text-green-800`;

  $: variantClass = variant === "error" ? errorClass : successClass;
  $: baseClass = `p-4 py-6 text-base rounded flex items-center font-bold ${variantClass} ${className}`;
</script>

<div class={baseClass}>
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
