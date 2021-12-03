<script lang="ts">
	import Home from './features/home/Home.svelte';
	import { authStore } from './lib/auth-store.ts';
  import SignIn from "./features/sign-in/SignIn.svelte"
</script>


<ion-app>
  {#if $authStore.type === 'signed-in'}
    <Home />
  {:else}
    <SignIn />
  {/if}
</ion-app>