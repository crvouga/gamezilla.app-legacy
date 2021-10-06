<style>
	:global([slot="title"]) {
		@apply text-2xl;
		@apply font-bold;
		@apply text-center;
		@apply w-full;
	}
</style>

<nav
	class="flex justify-items-center justify-between items-center p-2 border-gray-400 border-b-2">
	<slot name="left" />
	<slot name="title" />
	<slot name="right" />
</nav>
