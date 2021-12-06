<script lang="ts">
  import { signIn } from "$lib/sign-in"

  const signWithGoogle = async () => {
    await signIn({
      type: "google",
      redirectTo: window.location.href
    })
  }

</script>


<ion-page>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        Sign In
      </ion-title>
    </ion-toolbar>

  </ion-header>

  <ion-content>
    <ion-item button on:click={signWithGoogle}>
      <ion-icon slot="start" name="logo-google" />
      <ion-label>Continue With Google</ion-label>
    </ion-item>
  </ion-content>
</ion-page>