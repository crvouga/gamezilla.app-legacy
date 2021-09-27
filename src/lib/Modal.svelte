<script lang="ts">
	export let state: 'opened' | 'closed';
</script>

{#if state === 'opened'}
	<div class="modal">
		<div class="content">
			<slot />
		</div>
	</div>
{/if}

<style>
	.content {
		border-radius: var(--border-radius);
		text-align: center;
		padding: var(--spacing);
		background-color: var(--surface-color);
		max-width: var(--small-breakpoint);
	}

	.modal {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.75);
		z-index: var(--modal-z-index);
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
