<script lang="ts">
	import "./page-header.css";
	export let title = "";
</script>

<nav
	class="flex justify-between items-center px-4 py-2 border-b border-gray h-12">
	{#if $$slots.prefix}
		<div class="flex items-center justify-start mr-4">
			<slot name="prefix" />
		</div>
	{/if}

	{#if title.length > 0}
		<div class="flex-1 title">{title}</div>
	{:else}
		<div class="flex-1 text-base">
			<slot />
		</div>
	{/if}

	<div class="flex items-center justify-end">
		<slot name="suffix" />
	</div>
</nav>
