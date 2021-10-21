<nav
	class="flex justify-between items-center px-4 py-2 border-gray-200 border-b-2">
	<div class="mr-4 w-10">
		<slot name="prefix" />
	</div>

	<div class="flex-1">
		<slot />
	</div>

	<div class="ml-4 w-10 flex items-center">
		<slot name="suffix" />
	</div>
</nav>
