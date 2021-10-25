<nav
	class="flex justify-between items-center px-4 py-2 border-b border-gray h-12">
	{#if $$slots.prefix}
		<div class="flex items-center justify-start mr-4">
			<slot name="prefix" />
		</div>
	{/if}

	<div class="flex-1">
		<slot />
	</div>

	<div class="flex items-center justify-end">
		<slot name="suffix" />
	</div>
</nav>
