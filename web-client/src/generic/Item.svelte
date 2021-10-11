<div class="p-4 flex items-center text-xl border-gray-300 border-b-2">
  <div class="mr-2">
    <slot name="start" />
  </div>
  <div class="flex-1">
    <slot />
  </div>
  <div>
    <slot name="end" />
  </div>
</div>
