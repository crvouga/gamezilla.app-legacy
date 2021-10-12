<div
  class="p-4 flex justify-center items-center text-lg font-bold border-gray-300 border-b-2">
  <div class="mr-4">
    <slot name="start" />
  </div>

  <div class="flex-1">
    <slot />
  </div>

  <div>
    <slot name="end" />
  </div>
</div>
