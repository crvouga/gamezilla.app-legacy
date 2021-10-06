<script lang="ts">
  let className: string;
  export { className as class };
</script>

<div
  class="fixed w-full h-screen bg-black backdrop-opacity-50 grid place-items-center {className}">
  <slot />
</div>
