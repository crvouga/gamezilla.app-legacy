<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { navigate } from "svelte-routing";
	let className: string = "";
	export { className as class };
	export let href: string | undefined = undefined;

	export let isLoading: boolean = false;

	const eventDispatch = createEventDispatcher();

	const handleClick = () => {
		if (href) {
			navigate(href);
		}

		eventDispatch("click", {});
	};
</script>

<button
	on:click={handleClick}
	type="button"
	class="{className} w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 "
	{...$$restProps}>
	<slot />
</button>
