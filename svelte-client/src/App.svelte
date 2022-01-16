<script lang="ts">
	import LoggedOut from "./logged-out/LoggedOut.svelte";
</script>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	:global(body) {
		@apply fixed top-0 left-0 bottom-0 right-0 overflow-hidden select-none;
	}
</style>

<LoggedOut />
