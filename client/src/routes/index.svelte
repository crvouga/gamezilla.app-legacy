<script lang="ts">
	import { boardStore } from '$lib';
	import Tabs from '$lib/Tabs.svelte';

</script>



{JSON.stringify($boardStore)}

<Tabs />