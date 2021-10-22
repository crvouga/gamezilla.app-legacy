<nav
	class="flex justify-between items-center px-4 py-2 border-gray-200 border-b-2">
	<div class="w-10 flex items-center justify-start">
		<slot name="prefix" />
	</div>

	<div class="flex-1">
		<slot />
	</div>

	<div class="w-10 flex items-center justify-end">
		<slot name="suffix" />
	</div>
</nav>
