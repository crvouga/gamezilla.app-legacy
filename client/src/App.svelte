<script lang="ts">
	import Home from './home/Home.svelte';
	import { authStore } from './lib/auth-store.ts';
  import SignIn from "./sign-in/SignIn.svelte"
</script>


<ion-app>
  {#if $authStore.type === 'signed-in'}
    <Home />
  {:else}
    <SignIn />
  {/if}
</ion-app>