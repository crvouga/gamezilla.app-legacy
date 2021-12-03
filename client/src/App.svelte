<script lang="ts">
	const handleSignIn = () => {
		console.log("SIGN IN")
	}
</script>



<ion-app>
	<ion-header>
		<ion-toolbar>
			<ion-title>
				Sign In
			</ion-title>
		</ion-toolbar>

	</ion-header>
	<ion-content>
		<ion-item button on:click={handleSignIn}>
			<ion-icon slot="start" name="logo-google" />
			<ion-label>Continue With Google</ion-label>
		</ion-item>
	</ion-content>
</ion-app>