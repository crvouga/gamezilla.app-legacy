<script lang="ts">
	export let text: string;
	export let variant: 'title' | 'small-title' | 'medium-title' | 'body' = 'body';
	export let align: 'center' | 'left' = 'left';

	let classProp: string = '';
	export { classProp as class };

	$: typographyClass = `${classProp} ${align}`;
</script>

{#if variant === 'title'}
	<h1 class={classProp}>{text}</h1>
{:else if variant === 'medium-title'}
	<h3 class={classProp}>{text}</h3>
{:else if variant === 'small-title'}
	<h6 class={classProp}>{text}</h6>
{:else if variant === 'body'}
	<p class={classProp}>{text}</p>
{/if}

<style>
	* {
		text-align: center;
	}

	h1 {
		font-size: 2rem;
	}

	h3 {
		font-size: 1.5rem;
	}

	h6 {
		font-size: 1.2rem;
	}

	p {
		font-size: medium;
	}
</style>
