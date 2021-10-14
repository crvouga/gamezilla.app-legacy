<script lang="ts">
  let className: string = "";
  export { className as class };
</script>

<div
  class="{className} hover:opacity-60 active:opacity-30 cursor-pointer"
  on:click>
  <slot />
</div>
