<script lang="ts">
  import { signIn } from "./sign-in"

	const handleSignIn = (...params: Parameters<typeof signIn>) => async () => {
    const { errors } = await signIn(...params)
    
	}
</script>


<ion-header>
  <ion-toolbar>
    <ion-title>
      Sign In
    </ion-title>
  </ion-toolbar>

</ion-header>

<ion-content>
  <ion-item button on:click={handleSignIn({type: "google", redirectTo: window.location.href})}>
    <ion-icon slot="start" name="logo-google" />
    <ion-label>Continue With Google</ion-label>
  </ion-item>
</ion-content>