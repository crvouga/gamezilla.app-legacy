<style>
	:global([slot="title"]) {
		@apply text-2xl;
		@apply font-bold;
		@apply text-center;
		@apply w-full;
	}
</style>

<nav
	class="flex justify-items-center justify-between items-center px-4 py-4 border-gray-300 border-b-2">
	<slot name="left" />
	<slot name="title" />
	<slot name="right" />
</nav>
