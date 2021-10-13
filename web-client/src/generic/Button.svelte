<script lang="ts">
	let className: string = "";
	export { className as class };
	export let href: string | undefined = undefined;
	export let isLoading: boolean = false;
</script>

<button
	on:click
	type="button"
	class="{className} uppercase w-full flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
	{#if $$slots.prefix}
		<div class="pr-2 flex items-center justify-center">
			<slot name="prefix" />
		</div>
	{/if}
	<slot />
</button>
