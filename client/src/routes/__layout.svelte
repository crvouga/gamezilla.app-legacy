<script lang='ts'>
  import { authStore } from '$lib/auth-store';
  import SignIn from './sign-in/index.svelte';

</script>


<ion-app>
  
  {#if $authStore.type === 'signed-in'}
    hello
  {:else}
    <SignIn />
  {/if}
</ion-app>

