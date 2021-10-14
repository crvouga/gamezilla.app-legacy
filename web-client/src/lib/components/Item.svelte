<div
  class="p-4 flex justify-center items-center text-base text-gray-800 border-gray-200 border-b-2">
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
