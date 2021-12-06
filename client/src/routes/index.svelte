<script lang="ts">
	// import Tabs from '$lib/Tabs.svelte';
  import { signOut } from '$lib/sign-out';
</script>


<ion-page>
<ion-header>
  <ion-toolbar>
    <ion-title>
      Home
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-item button on:click={() => signOut()}>
    <ion-icon slot="start" name="log-out-outline"></ion-icon>
    <ion-label>Sign Out</ion-label>
  </ion-item>
</ion-content>

<!-- <Tabs /> -->

</ion-page>