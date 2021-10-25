<script lang="ts">
  let className: string = "";
  export { className as class };
</script>

<div
  class="p-4 flex justify-center items-center border-gray-200 border-b {className}">
  <div class="mr-4">
    <slot name="start" />
  </div>

  <div class="flex-1">
    <slot />
  </div>

  <div class="">
    <slot name="end" />
  </div>
</div>
