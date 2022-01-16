<script lang="ts">
  let className = "";
  export { className as class };
</script>

<div class="p-4 drop-shadow-md rounded-md bg-white {className}">
  <slot />
</div>
