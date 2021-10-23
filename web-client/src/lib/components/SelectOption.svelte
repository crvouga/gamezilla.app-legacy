<script lang="ts">
  export let value = "";

  let className = "";
  export { className as class };

  $: baseClass = `w-full text-base ${className}`;
</script>

<option class={baseClass} {value}>
  <slot />
</option>
